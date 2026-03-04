const LAMBDA_URL = "https://c6eazcqlvr2qhx4pvphs3i3vza0olarb.lambda-url.us-east-2.on.aws/";

let currentEmail = "";

function login() { auth("login"); }
function register() { auth("register"); }

function setMessage(text, success) {
  const message = document.getElementById("message");
  if (!message) return;
  message.style.color = success ? "green" : "red";
  message.textContent = text;
}

function showOtp(show) {
  const section = document.getElementById("otpSection");
  if (section) section.style.display = show ? "block" : "none";
}

function auth(route) {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  currentEmail = email;

  showOtp(false);
  setMessage("", true);

  fetch(`${LAMBDA_URL}${route}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  })
    .then(res => res.json())
    .then(data => {
      setMessage(data.message || "", !!data.success);

      if (data.success && (route === "login" || route === "register")) {
        // Show OTP input after successful login or registration.
        showOtp(true);
      }
    })
    .catch(() => {
      setMessage("Server not reachable", false);
    });
}

function verifyOtp() {
  const code = document.getElementById("otp").value.trim();
  if (!currentEmail || !code) {
    setMessage("Please enter your email/password and the OTP code.", false);
    return;
  }

  fetch(`${LAMBDA_URL}verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: currentEmail, code })
  })
    .then(res => res.json())
    .then(data => {
      setMessage(data.message || "", !!data.success);
      if (data.success) {
        showOtp(false);
      }
    })
    .catch(() => {
      setMessage("Server not reachable", false);
    });
}
