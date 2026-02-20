AWS Lambda + S3 Login Demo (Python 3.14, MySQL via PyMySQL Layer)

This demo implements a simple username/password flow where authentication is handled by an AWS Lambda function that connects to a MySQL database using PyMySQL. The frontend is a static site hosted on Amazon S3. The Lambda exposes two routes via a Function URL:
- POST /login
- POST /register

What you get
- Backend: Python 3.14 AWS Lambda that connects to MySQL using PyMySQL
- Frontend: Simple HTML/CSS/JS login page in frontend/
- Database: Example schema and seed data in database/create_database.sql

Repo structure
- backend/authentication.py   (Lambda handler)
- frontend/                   (Static frontend: login.html, login.js, style.css)
- database/create_database.sql

Prerequisites
- AWS account with permissions for Lambda, S3, and (optionally) RDS MySQL
- A reachable MySQL database (Amazon RDS or other), and its endpoint/credentials
- Lambda runtime: Python 3.14

1) Database: create schema and seed users
- If you don’t already have a MySQL database, create an RDS MySQL instance and allow your Lambda to reach it (VPC config and security groups as needed).
- Run database/create_database.sql on your database to create a users table and insert demo users. Note: The script creates a database named user_id. Either:
  - Change DB_NAME in backend/authentication.py to user_id, or
  - Modify the SQL to match your chosen database name.

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

B. Add the code
- In the Code tab, replace the default code with the contents of backend/authentication.py in this repo
- Update DB_HOST, DB_USER, DB_PASSWORD, and DB_NAME near the top of that file to match your database
- Deploy the function

C. Attach the PyMySQL layer
- Lambda > Your function > Layers > Add a layer > Select the layer you created in step 2

D. Enable a public Function URL
- Lambda > Your function > Function URL > Create function URL
  - Auth type: NONE (public). For a real app, use IAM/custom auth.
  - CORS: Enable
    - Allow origins: * (for demo; restrict later)
    - Allow methods: POST, OPTIONS
    - Allow headers: Content-Type
- Note the Function URL. It will look like: https://<id>.lambda-url.<region>.on.aws/

E. Test the endpoints
Use curl to verify the login route (make sure you seeded the database with the demo users or have created your own):

curl -i -X POST "https://<your-function-url>/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"student","password":"1234"}'

You should see HTTP/1.1 200 with a JSON body like: {"success": true, "message": "Login successful"}

You can also test registration:

curl -i -X POST "https://<your-function-url>/register" \
  -H "Content-Type: application/json" \
  -d '{"username":"newuser","password":"newpass"}'

4) Frontend: host on S3
- Create an S3 bucket and enable static website hosting.
- For a public demo, allow public read access (bucket policy). Restrict in production.
- Upload the contents of the frontend/ folder (login.html, login.js, style.css) to the bucket root.
- Edit frontend/login.js and set LAMBDA_URL to your Function URL (include the trailing slash). Example:

const LAMBDA_URL = "https://<id>.lambda-url.<region>.on.aws/";

- Open the S3 website endpoint in your browser and try the login form.

Default demo users (from the SQL seed file)
- student / 1234
- admin / password123
- test / 12345
- user / password

Notes and troubleshooting
- PyMySQL import errors: Ensure the layer zip has a top-level folder named python and that the layer is created for Python 3.14 and attached to the function.
- Database connectivity: Verify security groups, subnets/VPC settings (if your Lambda runs in a VPC), and that DB_HOST/DB_USER/DB_PASSWORD/DB_NAME are correct. Check CloudWatch logs for errors.
- 404 Route not found: Call the Function URL with /login or /register (the base URL alone will return 404).
- CORS: OPTIONS is handled by the function. Ensure Function URL CORS allows POST and Content-Type: application/json.
- Security: Do not hard-code secrets for production; use AWS Secrets Manager or environment variables, restrict CORS, and prefer API Gateway + IAM/authorizers over a public Function URL.

