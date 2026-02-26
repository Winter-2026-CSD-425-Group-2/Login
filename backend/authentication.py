import json
import pymysql
import boto3
import random
import string
from datetime import datetime, timedelta, timezone

# ================= CONFIGURATIONS =================
DB_HOST = "database-group2-carolina.crwamwoa4769.us-east-2.rds.amazonaws.com"
DB_USER = "admin"
DB_PASSWORD = "placeholder"
DB_NAME = "user_id"

SENDER_EMAIL = "placeholder"
AWS_REGION = "us-east-1"

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
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
        },
        "body": json.dumps(body)
    }


def generate_code():
    return ''.join(random.choices(string.digits, k=6))

def send_verification_email(to_email, code):
    ses.send_email(
        Source=SENDER_EMAIL,
        Destination={"ToAddresses": [to_email]},
        Message={
            "Subject": {"Data": "Your Login OTP"},
            "Body": {
                "Text": {
                    "Data": f"Your OTP is {code}. It expires in 5 minutes."
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

    username = data.get("username")
    password = data.get("password")

    conn = None

    try:
        conn = get_connection()
        with conn.cursor() as cursor:

            if path == "/register":

                if not username or not password:
                    return build_response(400, {"success": False, "message": "Missing username or password"})

                check_sql = "SELECT id FROM users WHERE username=%s"
                cursor.execute(check_sql, (username,))
                existing_user = cursor.fetchone()

                if existing_user:
                    return build_response(409, {"success": False, "message": "Username already exists"})

                insert_sql = "INSERT INTO users (username, password) VALUES (%s, %s)"
                cursor.execute(insert_sql, (username, password))
                conn.commit()

                return build_response(201, {"success": True, "message": "User created successfully"})

            elif path == "/login":

                if not username or not password:
                    return build_response(400, {"success": False, "message": "Missing username or password"})

                sql = "SELECT password FROM users WHERE username=%s"
                cursor.execute(sql, (username,))
                user = cursor.fetchone()

                if not user or password != user["password"]:
                    return build_response(401, {"success": False, "message": "Invalid username or password"})

                # Generate OTP
                code = generate_code()
                expiry = datetime.now(timezone.utc) + timedelta(minutes=5)

                otp_store[username] = {
                    "code": code,
                    "expiry": expiry
                }

                send_verification_email(username, code)

                return build_response(200, {
                    "success": True,
                    "message": "OTP sent to email"
                })

            elif path == "/verify":

                code = data.get("code")

                if not username or not code:
                    return build_response(400, {"success": False, "message": "Missing username or code"})

                stored = otp_store.get(username)

                if not stored:
                    return build_response(401, {"success": False, "message": "No OTP found"})

                if stored["code"] != code:
                    return build_response(401, {"success": False, "message": "Invalid OTP"})

                if datetime.now(timezone.utc) > stored["expiry"]:
                    return build_response(401, {"success": False, "message": "OTP expired"})

                del otp_store[username]

                return build_response(200, {
                    "success": True,
                    "message": "Login successful"
                })

            else:
                return build_response(404, {"success": False, "message": "Route not found"})

    except Exception as e:
        print("Error:", str(e))
        return build_response(500, {"success": False, "message": "Server error"})

    finally:
        if conn:
            conn.close()