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


def build_response(status_code, body):
    return {
        "statusCode": status_code,
        "body": json.dumps(body)
    }


def lambda_handler(event, context):
    path = event.get("rawPath") or event.get("path") or ""
    try:
        data = json.loads(event.get("body", "{}"))
    except json.JSONDecodeError:
        return build_response(400, {
            "success": False,
            "message": "Invalid JSON"
        })

    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return build_response(400, {
            "success": False,
            "message": "Missing username or password"
        })

    try:
        conn = get_connection()

        with conn.cursor() as cursor:

            if path == "/login":
                sql = "SELECT password FROM users WHERE username=%s"
                cursor.execute(sql, (username,))
                user = cursor.fetchone()

                if not user or password != user["password"]:
                    return build_response(401, {
                        "success": False,
                        "message": "Invalid username or password"
                    })

                return build_response(200, {
                    "success": True,
                    "message": "Login successful"
                })

            elif path == "/signin":
                check_sql = "SELECT id FROM users WHERE username=%s"
                cursor.execute(check_sql, (username,))
                existing_user = cursor.fetchone()

                if existing_user:
                    return build_response(409, {
                        "success": False,
                        "message": "Username already exists"
                    })

                insert_sql = "INSERT INTO users (username, password) VALUES (%s, %s)"
                cursor.execute(insert_sql, (username, password))
                conn.commit()

                return build_response(201, {
                    "success": True,
                    "message": "User created successfully"
                })

            else:
                return build_response(404, {
                    "success": False,
                    "message": "Route not found"
                })

        conn.close()

    except Exception as e:
        print("Error:", str(e))
        return build_response(500, {
            "success": False,
            "message": "Server error"
        })
