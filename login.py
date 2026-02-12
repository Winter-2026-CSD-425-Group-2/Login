import json
import pymysql

DB_HOST = "placeholder"
DB_USER = "placeholder"
DB_PASSWORD = "placeholder"
DB_NAME = "placeholder"


def get_connection():
    return pymysql.connect(
        host=DB_HOST,
        user=DB_USER,
        password=DB_PASSWORD,
        database=DB_NAME,
        cursorclass=pymysql.cursors.DictCursor
    )


def lambda_handler(event, context):
    try:
        data = json.loads(event.get("body", "{}"))
    except:
        return {
            "statusCode": 400,
            "body": json.dumps({"success": False, "message": "Invalid JSON"})
        }

    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return {
            "statusCode": 400,
            "body": json.dumps({"success": False, "message": "Missing email or password"})
        }

    try:
        conn = get_connection()

        with conn.cursor() as cursor:
            sql = "SELECT password FROM users WHERE email=%s"
            cursor.execute(sql, (email,))
            user = cursor.fetchone()

        conn.close()

        if not user:
            return {
                "statusCode": 401,
                "body": json.dumps({"success": False, "message": "Invalid email or password"})
            }

        if password == user["password"]:
            return {
                "statusCode": 200,
                "body": json.dumps({"success": True, "message": "Login successful"})
            }

        return {
            "statusCode": 401,
            "body": json.dumps({"success": False, "message": "Invalid email or password"})
        }

    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps({"success": False, "error": str(e)})
        }
