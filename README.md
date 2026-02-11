Minimal AWS Lambda + S3 Login POC

This project moves the password validation logic from a local Flask server to an AWS Lambda function. The frontend is a static site you can host on Amazon S3.

What you get
- Backend: AWS Lambda function that validates a hard-coded username/password
- Frontend: Simple HTML/CSS/JS login form in the Login/ folder

Default credentials (for demo only)
- username: student
- password: 1234

Repo structure
- backEnd/app.py              (old Flask app, no longer needed for this POC)
- backEnd/lambda_function.py  (Lambda handler)
- Login/                      (Static frontend)

1) Backend: Deploy the Lambda function (Function URL)
These steps use a Lambda Function URL for the simplest possible public endpoint (no API Gateway setup).

A. Create the Lambda function
1. Open AWS Console > Lambda > Create function
2. Author from scratch
   - Name: login-poc (or any name)
   - Runtime: Python 3.11 (or 3.10+)
   - Architecture: x86_64
   - Create function

B. Add the code
1. In the Code tab, create a file named lambda_function.py and paste the contents from backEnd/lambda_function.py in this repo
2. Deploy the function

C. Enable a public Function URL
1. Lambda > Your function > Function URL > Create function URL
   - Auth type: NONE (public). For a real app, use IAM/custom auth.
   - CORS: Enable
     - Allow origins: * (for POC; restrict later)
     - Allow methods: POST
     - Allow headers: Content-Type
2. Note the Function URL. It will look like: https://<id>.lambda-url.<region>.on.aws/

D. Test the endpoint (optional)
Use curl to verify:

curl -i -X POST "https://<your-function-url>" \
  -H "Content-Type: application/json" \
  -d '{"username":"student","password":"1234"}'

You should see HTTP/1.1 200 and a JSON body: {"success": true, "message": "Login successful!"}

2) Frontend: Deploy to S3 static website hosting
A. Create an S3 bucket
1. S3 > Create bucket
   - Bucket name: unique globally (e.g., my-login-poc-123)
   - Region: your choice
   - Uncheck "Block all public access" (for a public demo) and acknowledge the warning
   - Create bucket

B. Enable static website hosting
1. Open the bucket > Properties > Static website hosting
2. Enable
3. Index document: index.html
4. Save changes

C. Allow public read (demo only)
1. Open the bucket > Permissions
2. Bucket policy > Edit. Use a simple public read policy (replace BUCKET_NAME):

{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::BUCKET_NAME/*"
    }
  ]
}

D. Upload the frontend
1. Upload the contents of the Login/ folder (index.html, script.js, style.css) into the bucket root

E. Point the frontend to your Lambda URL
1. In S3 (or locally before upload), edit Login/script.js
2. Replace the placeholder with your function URL:

const LAMBDA_URL = "https://REPLACE_WITH_LAMBDA_FUNCTION_URL";

Set it to the exact Function URL from step 1C (keep the trailing slash if present).

F. Open your site
1. In the bucket > Properties > Static website hosting, copy the Website endpoint
2. Open it in your browser, try the login form

Notes
- The old Flask server (backEnd/app.py) is no longer required for this POC.
- For production, DO NOT use hard-coded credentials or public Function URLs. Add authentication, secrets management, rate limiting, and restrict CORS to your exact S3/CloudFront origin.
- You can put CloudFront in front of the S3 site and the Lambda URL for better controls and TLS/URL consistency.
