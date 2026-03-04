import json
import pymysql
import boto3
import random
import string
import os
from datetime import datetime, timedelta, timezone

# ================= CONFIGURATIONS =================
DB_HOST = "database-group2-carolina.crwamwoa4769.us-east-2.rds.amazonaws.com"
DB_USER = "admin"
DB_PASSWORD = os.environ.get("DB_PASSWORD")
DB_NAME = "user_id"

SENDER_EMAIL = os.environ.get("SENDER_EMAIL")
AWS_REGION = "us-east-2"

ses = boto3.client("ses", region_name=AWS_REGION)


otp_store = {}


def get_connection():
    return pymysql.connect(
        host=DB_HOST,
        user=DB_USER,
        password=DB_PASSWORD,
        database=DB_NAME,
        cursorclass=pymysql.cursors.DictCursor
    )


def build_response(status_code, body):
    return {
        "statusCode": status_code,
        "headers": {
            "Content-Type": "application/json"
        },
        "body": json.dumps(body)
    }


def generate_code():
    return ''.join(random.choices(string.digits, k=6))


def send_otp_code(to_email):
    # Generate OTP
    code = generate_code()
    expiry = datetime.now(timezone.utc) + timedelta(minutes=5)

    otp_store[to_email] = {
        "code": code,
        "expiry": expiry
    }

    ses.send_email(
        Source=SENDER_EMAIL,
        Destination={"ToAddresses": [to_email]},
        Message={
            "Subject": {"Data": "Your One-Time Code"},
            "Body": {
                "Text": {
                    "Data": f"Your one-time code is {code}. If you did not request this, you can ignore this email."
                }
            },
        },
    )


def require_fields(data, fields, message):
    """Return a 400 response if any required field is missing, otherwise None."""
    if any(not data.get(f) for f in fields):
        return build_response(400, {"success": False, "message": message})
    return None


def get_user_by_email(cursor, email):
    sql = "SELECT id, password FROM users WHERE email=%s"
    cursor.execute(sql, (email,))
    return cursor.fetchone()


def validate_otp(email, code):
    """Validate an OTP with a single catch-all error message.

    Returns a 401 response with a unified message if:
    - No OTP is found for the email
    - The code does not match
    - The OTP has expired
    Otherwise returns None and consumes the OTP.
    """
    stored = otp_store.get(email)
    if not stored or stored["code"] != code or datetime.now(timezone.utc) > stored["expiry"]:
        return build_response(401, {"success": False, "message": "Invalid or expired OTP"})
    # Consume the OTP code
    del otp_store[email]
    return None



def lambda_handler(event, context):

    method = (
        event.get("httpMethod")
        or event.get("requestContext", {}).get("http", {}).get("method")
        or ""
    ).upper()

    if method == "OPTIONS":
        return build_response(200, {})

    path = event.get("rawPath") or event.get("path") or ""

    try:
        data = json.loads(event.get("body", "{}"))
    except:
        return build_response(400, {"success": False, "message": "Invalid JSON"})

    email = data.get("email")

    conn = None

    try:
        conn = get_connection()
        with conn.cursor() as cursor:

            if path == "/register":

                missing = require_fields(data, ["email", "password"], "Missing email or password")
                if missing:
                    return missing

                existing_user = get_user_by_email(cursor, email)
                if existing_user:
                    return build_response(409, {"success": False, "message": "Email already exists"})

                insert_sql = "INSERT INTO users (email, password) VALUES (%s, %s)"
                cursor.execute(insert_sql, (email, data.get("password")))
                conn.commit()

                return build_response(201, {"success": True, "message": "User created successfully"})

            elif path == "/login":

                missing = require_fields(data, ["email", "password"], "Missing email or password")
                if missing:
                    return missing

                user = get_user_by_email(cursor, email)
                if not user or data.get("password") != user.get("password"):
                    return build_response(401, {"success": False, "message": "Invalid email or password"})

                send_otp_code(email)

                return build_response(200, {
                    "success": True,
                    "message": "OTP sent to email"
                })

            elif path == "/verify":

                missing = require_fields(data, ["email", "code"], "Missing email or code")
                if missing:
                    return missing

                error = validate_otp(
                    email,
                    data.get("code"),
                )
                if error:
                    return error

                return build_response(200, {
                    "success": True,
                    "message": "Verification successful"
                })

            elif path == "/request-password-reset":

                missing = require_fields(data, ["email"], "Missing email")
                if missing:
                    return missing

                user = get_user_by_email(cursor, email)
                if not user:
                    return build_response(404, {"success": False, "message": "Email not found"})

                send_otp_code(email)

                return build_response(200, {"success": True, "message": "Password reset code sent to email"})

            elif path == "/reset-password":

                missing = require_fields(data, ["email", "code", "newPassword"], "Missing email, code, or new password")
                if missing:
                    return missing

                error = validate_otp(
                    email,
                    data.get("code"),
                )
                if error:
                    return error

                update_sql = "UPDATE users SET password=%s WHERE email=%s"
                cursor.execute(update_sql, (data.get("newPassword"), email))
                conn.commit()

                return build_response(200, {"success": True, "message": "Password has been reset successfully"})

            else:
                return build_response(404, {"success": False, "message": "Route not found"})

    except Exception as e:
        print("Error:", str(e))
        return build_response(500, {"success": False, "message": "Server error"})

    finally:
        if conn:
            conn.close()