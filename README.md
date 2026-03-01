AWS Lambda + S3 Login Demo with Email OTP (Python 3.14, MySQL via PyMySQL, AWS SES)

Two-step authentication demo with email-based OTP. This repository includes:
- A deployable AWS Lambda backend that connects to MySQL and sends OTP via SES
- A minimal S3-hosted frontend
- SQL for creating the users table

Overview of the auth flow
1) Register: Users enter a username (email) and password. The backend sends a 6‑digit OTP for registration and holds a pending account. The frontend shows the OTP input so the user can complete registration.
2) Login: Users enter a username and password. The backend validates credentials and sends a 6‑digit OTP to the user's email via AWS SES.
3) Verify: The user submits the OTP to /verify to complete the flow (registration or login).

Routes
- POST /register: Begin registration and send a 6‑digit OTP to the provided email. The account is created only after a successful /verify.
- POST /login: Validate credentials; on success, send a 6‑digit OTP to the user's email.
- POST /verify: Validate the OTP and finish the flow (creates the account if this was a registration).
- OPTIONS: Handled for CORS.

Repo structure
- backend/authentication.py           (Lambda handler)
- aws_config/ses_send_email_policy.json  (inline IAM policy allowing SES send)
- aws_config/s3_deploy_gha_policy.json   (IAM policy template for S3 deploy via GitHub Actions)
- aws_config/s3_public_read_bucket_policy.json (bucket policy template for public-read static website hosting)
- database/create_database.sql        (schema)
- frontend/                           (minimal S3-friendly UI: login.html, register.html, authentication.js, style.css)

Frontend (S3-hosted, uses real AWS backend)
- Location: frontend/
- Purpose: Simple register and login forms wired to your Lambda Function URL via frontend/authentication.js
- Includes an OTP input and Verify button. After registration, the page shows the OTP input immediately (no automatic login call); enter the code to complete account creation.

Prerequisites (for AWS deployment)
- AWS account with permissions for Lambda, S3, SES, and (optionally) RDS MySQL.
- A reachable MySQL database (Amazon RDS or other), and its endpoint/credentials.
- Lambda runtime: Python 3.14.
- AWS SES configured in your region. This repo defaults to us-east-2:
  - Verify a sender email address (used as SENDER_EMAIL).
  - If your SES account is in the sandbox, verify recipient emails or request production access.
  - Attach an IAM role/policy to the Lambda with permission to call ses:SendEmail.

1) Database: create schema
- If you don’t already have a MySQL database, create an RDS MySQL instance and allow your Lambda to reach it (VPC config and security groups as needed).
- Run database/create_database.sql on your database to create the users table. Note: The script creates a database named user_id. Either:
  - Change DB_NAME in backend/authentication.py to user_id, or
  - Modify the SQL to match your chosen database name.
- For email OTP to work in the AWS flow, usernames should be valid email addresses.

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
  - AWS_REGION: This repo defaults to us-east-2. Keep this value or change it to the region where your SES is configured.
- Grant the Lambda execution role permission to send email with SES. You can add the inline policy from aws_config/ses_send_email_policy.json:
  - Lambda > Your function > Configuration > Permissions > Role name
  - Add permissions > Create inline policy > JSON
  - Paste the contents of aws_config/ses_send_email_policy.json and save.
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
- For a public demo, allow public read access (bucket policy). Restrict in production. You can use the template at aws_config/s3_public_read_bucket_policy.json: replace YOUR_BUCKET_NAME with your bucket name and paste it under Permissions > Bucket policy. Ensure the bucket's Block Public Access settings allow public policies while you are using this demo.
- Upload the contents of the frontend/ folder (login.html, register.html, authentication.js, style.css) to the bucket root. Alternatively, use the included GitHub Actions workflow (see section below) to deploy automatically on each push to main.
- Edit frontend/authentication.js and set LAMBDA_URL to your Function URL (include the trailing slash). Example:

const LAMBDA_URL = "https://<id>.lambda-url.<region>.on.aws/";

- Note: The LAMBDA_URL in this repository is already set to a working Function URL in us-east-2 for the maintainer's deployment. If you are setting up your own SES/Lambda, replace it with your own Function URL.
- The provided pages include forms for register and login, an OTP input, and a Verify button that calls POST /verify. After registration, the UI shows the OTP fields and does not auto‑call /login; simply enter the code from your email.

5) Optional: Automatic S3 deployments with GitHub Actions
This repo includes a workflow at .github/workflows/deploy-frontend.yml that deploys the frontend/ directory to S3 on pushes to the main branch.

Prerequisites
- Create an S3 bucket and enable static website hosting (or front with CloudFront).
- Ensure the bucket policy allows public read if you are hosting directly from S3 for a demo. For production, prefer CloudFront with an origin access identity and restrict the bucket.
- Grant GitHub Actions access to your S3 bucket via an IAM user and access keys:
  1) Create a least-privilege S3 policy for your bucket. Use aws_config/s3_deploy_gha_policy.json as a template and replace YOUR_BUCKET_NAME with your actual bucket name. If your bucket has Object Ownership set to "Bucket owner enforced" (ACLs disabled), you may remove s3:PutObjectAcl from the policy.
     - IAM Console > Policies > Create policy > JSON > paste the updated JSON > Next > Create policy.
  2) Create an IAM user (e.g., github-actions-s3-deployer) and attach the policy:
     - IAM Console > Users > Create user > Name: github-actions-s3-deployer > Create user.
     - Open the user > Permissions > Add permissions > Attach policies directly > select the policy you created > Add permissions.
  3) Create access keys for the user:
     - IAM Console > Users > github-actions-s3-deployer > Security credentials > Create access key.
     - Choose "Application running outside AWS" and confirm. Copy the Access key ID and Secret access key.
  4) Add the following GitHub Actions secrets in your repository (Settings > Secrets and variables > Actions):
     - AWS_ACCESS_KEY_ID: the access key ID from step 3.
     - AWS_SECRET_ACCESS_KEY: the secret access key from step 3.
     - AWS_REGION: your AWS region (e.g., us-east-2).
     - S3_BUCKET: your bucket name.

Security notes
- Keep access scoped to only the required bucket; do not use wildcard resources.
- Rotate access keys regularly and remove unused ones.
- For production, consider using OpenID Connect (OIDC) with aws-actions/configure-aws-credentials to assume an IAM role, eliminating long-lived access keys.

How it works
- Trigger: Pushes to main that change files under frontend/ (or the workflow file itself).
- Steps:
  - Checks out the repo.
  - Configures AWS credentials.
  - Syncs non-HTML assets with a long cache (immutable) for better performance.
  - Syncs HTML files separately with no-cache so browsers always fetch the latest pages.
- After a successful run, your site is updated. If static website hosting is enabled, the URL is typically:
  http://<bucket-name>.s3-website-<region>.amazonaws.com

Notes
- The workflow uses aws-actions/configure-aws-credentials and the AWS CLI to perform the sync.
- If you use CloudFront, consider adding an additional job to create an invalidation when HTML or JS/CSS change.
- The workflow uses --delete to remove files in the bucket that are no longer present locally.

Important limitations and production notes
- OTP storage is in-memory inside the Lambda execution environment. If the function cold-starts or scales out, previously generated OTPs may be lost. For production, use a shared persistence layer (e.g., DynamoDB with TTL or ElastiCache/Redis) to store OTPs.
- Passwords in the sample are stored in plaintext. In production, store password hashes only (e.g., bcrypt, scrypt, Argon2) and enforce strong password policies.
- The Function URL setup uses public access (Auth type: NONE) for demo simplicity. In production, protect your endpoints with IAM or API Gateway + authorizers, and restrict CORS origins strictly.
- Add rate limiting/abuse protections (e.g., throttle login and OTP requests, temporary lockouts, or CAPTCHA) to prevent brute-force and spam.
- Avoid hardcoding secrets. Move DB and email config to environment variables or a secrets manager (AWS Secrets Manager/Parameter Store) and encrypt with KMS.
- Ensure SES identities are verified and configure SPF/DKIM for better email deliverability.
- Keep services in the same region when possible. This repository defaults to us-east-2. If SES is in a different region, make sure AWS_REGION in the code matches the SES region you intend to use.

Notes and troubleshooting
- PyMySQL import errors: Ensure the layer zip has a top-level folder named python and that the layer is created for Python 3.14 and attached to the function.
- Database connectivity: Verify security groups, subnets/VPC settings (if your Lambda runs in a VPC), and that DB_HOST/DB_USER/DB_PASSWORD/DB_NAME are correct. Check CloudWatch logs for errors.
- SES sending issues: Verify SENDER_EMAIL in SES, confirm AWS_REGION matches the SES region (default here is us-east-2), and that your account is out of sandbox or recipients are verified. Review CloudWatch logs for ses:SendEmail errors.
- CORS errors from the browser: Make sure Function URL CORS is enabled with method POST and header Content-Type, and that your frontend uses the exact Function URL (including the trailing slash).
- Layer/architecture mismatch: If you choose arm64 for the function, create an arm64-compatible layer or switch to x86_64 as shown above.
- OTP not received: Check CloudWatch logs for SES errors, confirm the recipient is verified if your SES account is in sandbox, and check spam/junk folders.
