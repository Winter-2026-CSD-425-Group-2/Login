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
    password = data.get("password")

    conn = None

    try:
        conn = get_connection()
        with conn.cursor() as cursor:

            if path == "/register":

                if not email or not password:
                    return build_response(400, {"success": False, "message": "Missing email or password"})

                check_sql = "SELECT id FROM users WHERE email=%s"
                cursor.execute(check_sql, (email,))
                existing_user = cursor.fetchone()

                if existing_user:
                    return build_response(409, {"success": False, "message": "Email already exists"})

                insert_sql = "INSERT INTO users (email, password) VALUES (%s, %s)"
                cursor.execute(insert_sql, (email, password))
                conn.commit()

                return build_response(201, {"success": True, "message": "User created successfully"})

            elif path == "/login":

                if not email or not password:
                    return build_response(400, {"success": False, "message": "Missing email or password"})

                sql = "SELECT password FROM users WHERE email=%s"
                cursor.execute(sql, (email,))
                user = cursor.fetchone()

                if not user or password != user["password"]:
                    return build_response(401, {"success": False, "message": "Invalid email or password"})

                send_otp_code(email)

                return build_response(200, {
                    "success": True,
                    "message": "OTP sent to email"
                })

            elif path == "/verify":

                code = data.get("code")

                if not email or not code:
                    return build_response(400, {"success": False, "message": "Missing email or code"})

                stored = otp_store.get(email)

                if not stored:
                    return build_response(401, {"success": False, "message": "No OTP found"})

                if stored["code"] != code:
                    return build_response(401, {"success": False, "message": "Invalid OTP"})

                if datetime.now(timezone.utc) > stored["expiry"]:
                    return build_response(401, {"success": False, "message": "OTP expired"})

                del otp_store[email]

                return build_response(200, {
                    "success": True,
                    "message": "Verification successful"
                })

            elif path == "/request-password-reset":

                if not email:
                    return build_response(400, {"success": False, "message": "Missing email"})

                # Ensure user exists
                check_sql = "SELECT id FROM users WHERE email=%s"
                cursor.execute(check_sql, (email,))
                user = cursor.fetchone()
                if not user:
                    return build_response(404, {"success": False, "message": "Email not found"})

                # Send password reset email
                send_otp_code(email)

                return build_response(200, {"success": True, "message": "Password reset code sent to email"})

            elif path == "/reset-password":

                code = data.get("code")
                new_password = data.get("newPassword")

                if not email or not code or not new_password:
                    return build_response(400, {"success": False, "message": "Missing email, code, or new password"})

                stored = otp_store.get(email)
                if not stored:
                    return build_response(401, {"success": False, "message": "No reset request found"})

                if stored["code"] != code:
                    return build_response(401, {"success": False, "message": "Invalid reset code"})

                if datetime.now(timezone.utc) > stored["expiry"]:
                    return build_response(401, {"success": False, "message": "Reset code expired"})

                # Update the user's password
                update_sql = "UPDATE users SET password=%s WHERE email=%s"
                cursor.execute(update_sql, (new_password, email))
                conn.commit()

                # Clear the reset code
                del otp_store[email]

                return build_response(200, {"success": True, "message": "Password has been reset successfully"})

            else:
                return build_response(404, {"success": False, "message": "Route not found"})

    except Exception as e:
        print("Error:", str(e))
        return build_response(500, {"success": False, "message": "Server error"})

    finally:
        if conn:
            conn.close()