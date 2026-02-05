# Simple Web Login Demo (HTML, CSS, JS + Flask)

An accessible front-end login form with a tiny Flask backend for demo purposes. Credentials are hard-coded on the backend for simplicity.

Key goals:
- Accessibility-first: semantic HTML and labels.
- Progressive enhancement: client-side validation and feedback.
- Simplicity: minimal dependencies, straightforward JS + Flask.

---

## Project Structure

- `index.html` — Markup for the login form.
- `script.js` — Behavior: password toggle, validation, and API call to the backend.
- `styles.css` — Minimal styling.
- `backend/`
  - `application.py` — Flask app exposing `/login` (hard-coded credential check) and `/` health route.
  - `requirements.txt` — Python dependencies.

---

## Local Development

Backend (Flask):
1. Open a terminal in `backend/`.
2. Create a virtual environment and install deps:
   - python3 -m venv .venv
   - source .venv/bin/activate
   - pip install -r requirements.txt
3. Run the server:
   - python application.py
   - It will listen on http://localhost:5000

Frontend:
- Open `index.html` directly in your browser OR serve the files with a static server.
- For local dev, `script.js` defaults to calling `http://localhost:5000`.

Test the API:
- curl -i -X POST http://localhost:5000/login -H 'Content-Type: application/json' -d '{"email":"user@example.com","password":"password"}'

---

## Deploy: Frontend to Amazon S3 (Static Website Hosting)

Simplest path using the AWS Console:
1. Create an S3 bucket (name must be globally unique). Choose the region you prefer.
2. Enable static website hosting:
   - Properties > Static website hosting > Enable
   - Index document: `index.html`
3. Make the site publicly readable for this demo (not recommended for sensitive data):
   - Permissions > Block public access: disable "Block all public access" (acknowledge the warning).
   - Add a bucket policy that allows public read of objects (AWS can auto-generate one for static sites) or use this minimal example, replacing `YOUR-BUCKET-NAME`:
     {
       "Version": "2012-10-17",
       "Statement": [
         {
           "Sid": "PublicReadGetObject",
           "Effect": "Allow",
           "Principal": "*",
           "Action": "s3:GetObject",
           "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME/*"
         }
       ]
     }
4. Upload the frontend files: `index.html`, `script.js`, `styles.css`.
5. Note the Static website hosting endpoint URL; this is your site URL.

---

## Deploy: Backend to AWS Elastic Beanstalk (Python/Flask)

Using the AWS Console (no EB CLI required):
1. Zip the backend folder contents (do not include the folder itself in the zip, only its files):
   - `application.py`
   - `requirements.txt`
2. Go to Elastic Beanstalk > Create application:
   - Application name: e.g., `login-demo`
   - Platform: `Python`
   - Platform branch: latest available
   - Application code: Upload your zip from step 1
3. Create the environment (Web server environment). Wait until status is Green.
4. Test the environment URL in a browser: `https://YOUR-EB-ENV.elasticbeanstalk.com/` should return `{ "status": "ok" }`.
5. Test the login API:
   - curl -i -X POST https://YOUR-EB-ENV.elasticbeanstalk.com/login -H 'Content-Type: application/json' -d '{"email":"user@example.com","password":"password"}'

CORS note:
- CORS is enabled for all origins in `application.py` for demo simplicity. In production, restrict origins to your S3 website domain.

---

## Connect Frontend to Backend

1. Edit `index.html` and set `window.API_BASE` to your Elastic Beanstalk environment URL:
   <script>
     window.API_BASE = 'https://YOUR-EB-ENV.elasticbeanstalk.com';
   </script>
2. Upload the updated `index.html` (and any other changed files) to your S3 bucket.
3. Open your S3 website URL. Use the following demo credentials:
   - Email: `user@example.com`
   - Password: `password`

If login fails, check:
- Browser devtools Network tab for the `/login` request/response.
- CORS errors (ensure `window.API_BASE` matches the EB URL and EB is reachable over HTTPS).
- EB environment health and logs.

---

## Security Disclaimers (Important for real apps)

- This demo hard-codes credentials; do not do this in production.
- Always use HTTPS end-to-end.
- Add authentication best practices: password hashing, sessions/JWTs, rate limiting, CSRF protection, and proper CORS restrictions.
