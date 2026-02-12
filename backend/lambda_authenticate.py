import json

CORRECT_USERNAME = "student"
CORRECT_PASSWORD = "1234"


def lambda_handler(event, context):
    # Basic CORS headers for S3-hosted frontend
    headers = {
        "Access-Control-Allow-Origin": "*",  # For simplicity of demo; restrict in production
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
    }

    # Determine HTTP method for both API Gateway v1 and Lambda Function URLs (HTTP API v2.0-style)
    method = (
        event.get("httpMethod")
        or event.get("requestContext", {}).get("http", {}).get("method")
        or ""
    ).upper()

    # Handle CORS preflight
    if method == "OPTIONS":
        return {
            "statusCode": 200,
            "headers": headers,
            "body": "",
        }

    try:
        # Assuming the body is a `str`, and that this `str` contains plain JSON text (not base64-encoded)
        data = json.loads(event.get("body") or "{}")

        username = data.get("username")
        password = data.get("password")

        if username == CORRECT_USERNAME and password == CORRECT_PASSWORD:
            response_body = {"success": True, "message": "Login successful!"}
            status_code = 200
        else:
            response_body = {"success": False, "message": "Invalid credentials"}
            status_code = 401

        return {
            "statusCode": status_code,
            "headers": headers,
            "body": json.dumps(response_body),
        }
    except Exception:
        return {
            "statusCode": 500,
            "headers": headers,
            "body": json.dumps({"success": False, "message": "Server error"}),
        }
