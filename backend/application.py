from flask import Flask, request, jsonify
from flask_cors import CORS

# Elastic Beanstalk looks for a module-level variable named "application"
application = Flask(__name__)
# Enable CORS for demo simplicity; in production, restrict origins to your S3 site
CORS(application, resources={r"/*": {"origins": "*"}})

HARDCODED_EMAIL = "user@example.com"
HARDCODED_PASSWORD = "password"

@application.route("/", methods=["GET"])
def health():
    return jsonify(status="ok"), 200

@application.route("/login", methods=["POST"]) 
def login():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip()
    password = data.get("password") or ""
    # "remember" is accepted but unused for this demo
    _remember = bool(data.get("remember", False))

    if email == HARDCODED_EMAIL and password == HARDCODED_PASSWORD:
        return jsonify(success=True, message="Successfully logged in."), 200
    else:
        return jsonify(success=False, error="Incorrect username or password"), 401

if __name__ == "__main__":
    # Local development
    application.run(host="0.0.0.0", port=5000, debug=True)
