import json
import base64

CORRECT_USERNAME = "student"
CORRECT_PASSWORD = "1234"


def lambda_handler(event, context):
    # Basic CORS headers for S3-hosted frontend
    headers = {
        "Access-Control-Allow-Origin": "*",  # For POC; restrict in production
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
        body = event.get("body") or "{}"
        if event.get("isBase64Encoded"):
            body = base64.b64decode(body).decode("utf-8")
        if isinstance(body, str):
            data = json.loads(body)
        else:
            data = body

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
