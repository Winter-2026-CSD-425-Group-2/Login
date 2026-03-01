const LAMBDA_URL = "https://c6eazcqlvr2qhx4pvphs3i3vza0olarb.lambda-url.us-east-2.on.aws/";

let currentUsername = "";
let currentPassword = "";

const login = () => auth("login");
const register = () => auth("register");
const verifyOtp = () => verify();

function setMessage(text, success) {
  const message = document.getElementById("message");
  if (!message) return;
  message.style.color = success ? "green" : "red";
  message.textContent = text;
}

function showOtp(show) {
  const section = document.getElementById("otpSection");
  if (section) {
    section.style.display = show ? "block" : "none";
    if (show) {
      const otpInput = document.getElementById("otp");
      if (otpInput) otpInput.focus();
    }
  }
}

function setLoading(isLoading, target) {
  const btn = target === "otp" ? document.getElementById("otpBtn") : document.getElementById("authBtn");
  if (!btn) return;
  btn.disabled = isLoading;
  if (!btn.dataset.originalText) {
    btn.dataset.originalText = btn.textContent;
  }
  let loadingText = "Please wait…";
  if (target === "login") loadingText = "Logging in…";
  else if (target === "register") loadingText = "Registering…";
  else if (target === "otp") loadingText = "Verifying…";
  btn.textContent = isLoading ? loadingText : btn.dataset.originalText;
}

function auth(route) {
  const usernameEl = document.getElementById("username");
  const passwordEl = document.getElementById("password");
  const username = (usernameEl?.value || "").trim();
  const password = passwordEl?.value || "";

  currentUsername = username;
  currentPassword = password;

  showOtp(false);
  setMessage("", true);

  if (!username || !password) {
    setMessage("Please enter both username and password.", false);
    if (!username && usernameEl) usernameEl.focus();
    else if (passwordEl) passwordEl.focus();
    return;
  }

  setLoading(true, route);

  fetch(`${LAMBDA_URL}${route}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  })
    .then(res => res.json())
    .then(async data => {
      setMessage(data.message || "", !!data.success);

      if (!data.success) {
        setLoading(false, route);
        return;
      }

      if (route === "login") {
        // Login triggers OTP via AWS SES; show OTP input.
        showOtp(true);
        setLoading(false, route);
      } else if (route === "register") {
        // Registration now sends OTP; show input to complete account creation.
        showOtp(true);
        setLoading(false, route);
      }
    })
    .catch(() => {
      setMessage("Server not reachable", false);
      setLoading(false, route);
    });
}

function verify() {
  const codeEl = document.getElementById("otp");
  const code = (codeEl?.value || "").trim();
  if (!currentUsername || !code) {
    setMessage("Please enter your username/password and the OTP code.", false);
    if (codeEl) codeEl.focus();
    return;
  }

  setLoading(true, "otp");

  fetch(`${LAMBDA_URL}verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: currentUsername, code })
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
    })
    .finally(() => setLoading(false, "otp"));
}
