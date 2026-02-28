AWS Lambda + S3 Login Demo with Email OTP (Python 3.14, MySQL via PyMySQL, AWS SES)

This demo implements a two-step authentication flow:
1) Users register with a username and password (use a valid email address as the username).
2) On login, the Lambda validates credentials and sends a 6-digit OTP to the user's email via AWS SES.
3) The user completes login by submitting the OTP to the /verify route.

What you get
- Backend: Python 3.14 AWS Lambda that connects to MySQL using PyMySQL, sends OTPs via AWS SES, and exposes routes for register/login/verify.
- Frontend: Simple HTML/CSS/JS pages in frontend/ (login.html, register.html, authentication.js) for basic register/login.
- Database: Example schema and seed data in database/create_database.sql.

Routes
- POST /register: Create a new user (username must be an email for OTP delivery).
- POST /login: Validate credentials; on success, send a 6-digit OTP to the user's email.
- POST /verify: Validate the OTP and finish the login.
- OPTIONS: Handled for CORS.

Repo structure
- backend/authentication.py   (Lambda handler)
- frontend/                   (Static frontend: login.html, register.html, authentication.js, style.css)
- database/create_database.sql

Prerequisites
- AWS account with permissions for Lambda, S3, SES, and (optionally) RDS MySQL.
- A reachable MySQL database (Amazon RDS or other), and its endpoint/credentials.
- Lambda runtime: Python 3.14.
- AWS SES configured in your chosen region:
  - Verify a sender email address (used as SENDER_EMAIL).
  - If your SES account is in the sandbox, verify recipient emails or request production access.
  - Attach an IAM role/policy to the Lambda with permission to call ses:SendEmail.

1) Database: create schema and seed users
- If you don’t already have a MySQL database, create an RDS MySQL instance and allow your Lambda to reach it (VPC config and security groups as needed).
- Run database/create_database.sql on your database to create a users table and insert demo users. Note: The script creates a database named user_id. Either:
  - Change DB_NAME in backend/authentication.py to user_id, or
  - Modify the SQL to match your chosen database name.
- For email OTP to work, usernames should be valid email addresses. The seed file includes simple usernames for demonstration; create/register users with real email addresses for OTP testing.

2) Package PyMySQL as a Lambda layer (Python 3.14)
PyMySQL is not included in the Lambda runtime, so you must attach it via a Lambda layer compatible with Python 3.14.

Build the layer (using a Linux environment, e.g., AWS CloudShell or an x86_64 Linux machine):

mkdir -p layer/python
pip install --upgrade pip
pip install --target layer/python pymysql
cd layer
zip -r ../pymysql-py3.14-layer.zip .

Create and attach the layer in AWS Console:
- Lambda > Layers > Create layer
  - Name: pymysql-py3-14
  - Upload: pymysql-py3.14-layer.zip
  - Compatible runtimes: Python 3.14
  - Compatible architectures: x86_64
- Open your Lambda function > Layers > Add a layer > Select the newly created layer

3) Backend: deploy the Lambda (Function URL)
These steps use a Lambda Function URL for the simplest public endpoint (no API Gateway).

A. Create the Lambda function
- AWS Console > Lambda > Create function > Author from scratch
  - Name: login-authentication
  - Runtime: Python 3.14
  - Architecture: x86_64

B. Add the code and configuration
- In the Code tab, replace the default code with the contents of backend/authentication.py in this repo.
- Update DB_HOST, DB_USER, DB_PASSWORD, and DB_NAME near the top of that file to match your database.
- Update SES config:
  - SENDER_EMAIL: Verified sender email address in SES.
  - AWS_REGION: Region where SES is configured (e.g., us-east-1).
- Ensure the Lambda's execution role has permission to call ses:SendEmail.
- Deploy the function.

C. Attach the PyMySQL layer
- Lambda > Your function > Layers > Add a layer > Select the layer you created in step 2.

D. Enable a public Function URL
- Lambda > Your function > Function URL > Create function URL
  - Auth type: NONE (public). For a real app, use IAM/custom auth.
  - CORS: Enable
    - Allow origins: * (for demo; restrict later)
    - Allow methods: POST
    - Allow headers: Content-Type
- Note the Function URL. It will look like: https://<id>.lambda-url.<region>.on.aws/

E. Test the endpoints
Register a user (use a valid email as the username):

curl -i -X POST "https://<your-function-url>/register" \
  -H "Content-Type: application/json" \
  -d '{"username":"user@example.com","password":"newpass"}'

Login (triggers OTP email):

curl -i -X POST "https://<your-function-url>/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"user@example.com","password":"newpass"}'

Verify the OTP (replace 123456 with the code from the email):

curl -i -X POST "https://<your-function-url>/verify" \
  -H "Content-Type: application/json" \
  -d '{"username":"user@example.com","code":"123456"}'

4) Frontend: host on S3
- Create an S3 bucket and enable static website hosting.
- For a public demo, allow public read access (bucket policy). Restrict in production.
- Upload the contents of the frontend/ folder (login.html, register.html, authentication.js, style.css) to the bucket root.
- Edit frontend/authentication.js and set LAMBDA_URL to your Function URL (include the trailing slash). Example:

const LAMBDA_URL = "https://<id>.lambda-url.<region>.on.aws/";

- The provided pages include forms for register and login. OTP verification currently isn't implemented in the frontend; use the curl example above or add a simple input and a fetch to POST /verify.

Default demo users (from the SQL seed file)
- student / 1234
- admin / password123
- test / 12345
- user / password

Notes and troubleshooting
- PyMySQL import errors: Ensure the layer zip has a top-level folder named python and that the layer is created for Python 3.14 and attached to the function.
- Database connectivity: Verify security groups, subnets/VPC settings (if your Lambda runs in a VPC), and that DB_HOST/DB_USER/DB_PASSWORD/DB_NAME are correct. Check CloudWatch logs for errors.
- SES sending issues: Verify SENDER_EMAIL in SES, confirm AWS_REGION matches the SES region, and that your account is out of sandbox or recipients are verified. Review CloudWatch logs for ses:SendEmail errors.
- 404 Route not found: Call the Function URL with /register, /login, or /verify (the base URL alone will return 404).
- CORS: OPTIONS is handled by the function. Ensure Function URL CORS allows POST and Content-Type: application/json.
- OTP storage: OTPs are stored in-memory per Lambda instance and expire after 5 minutes. They do not persist across cold starts or multiple instances. For production, use a durable store (e.g., DynamoDB) and add rate limiting.
- Security: Do not hard-code secrets for production; use AWS Secrets Manager or environment variables, restrict CORS, and prefer API Gateway + IAM/authorizers over a public Function URL. Hash passwords (e.g., bcrypt) instead of storing plaintext; this demo uses plaintext for simplicity.
