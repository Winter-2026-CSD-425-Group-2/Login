const LAMBDA_URL = "https://c6eazcqlvr2qhx4pvphs3i3vza0olarb.lambda-url.us-east-2.on.aws/";

let currentUsername = "";
let currentPassword = "";
let currentFlow = null; // "login" or "register"
let isAuthBusy = false; // prevent overlapping login/register calls
let isOtpBusy = false;  // prevent overlapping verify calls

const login = () => { currentFlow = "login"; return auth("login"); };
const register = () => { currentFlow = "register"; return auth("register"); };
const verifyOtp = () => verify();

function setMessage(text, success) {
  const message = document.getElementById("message");
  if (!message) return;
  // Avoid inline styling; use state classes instead
  message.classList.remove("message-success", "message-error");
  message.textContent = text || "";
  if (text) {
    message.classList.add(success ? "message-success" : "message-error");
  }
}

function showOtp(show) {
  const section = document.getElementById("otpSection");
  if (section) {
    // Avoid inline styling; toggle a CSS class instead
    section.classList.toggle("otp-visible", !!show);
    const otpInput = document.getElementById("otp");
    if (show && otpInput) {
      otpInput.focus();
    }
    if (!show && otpInput) {
      otpInput.value = ""; // clear any previous code
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
  if (isAuthBusy) return; // don't allow overlapping auth requests

  const usernameEl = document.getElementById("username");
  const passwordEl = document.getElementById("password");
  const username = (usernameEl?.value || "").trim();
  const password = passwordEl?.value || "";

  currentUsername = username;
  currentPassword = password;

  // Do not hide the OTP section here; it may have just been shown by a previous successful step
  setMessage("", true);

  if (!username || !password) {
    setMessage("Please enter both username and password.", false);
    if (!username && usernameEl) usernameEl.focus();
    else if (passwordEl) passwordEl.focus();
    return;
  }

  isAuthBusy = true;
  setLoading(true, route);

  fetch(`${LAMBDA_URL}${route}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  })
    .then(res => res.json())
    .then(async data => {
      if (route === "register") {
        if (data.success) {
          // Registration flow: backend already sends the OTP; prompt for it
          setMessage("We sent a verification code to your email. Enter it below to complete registration.", true);
          showOtp(true);
        } else {
          const msg = (data.message || "").trim();
          const friendly = msg.toLowerCase().includes("invalid username or password")
            ? "Could not start registration with those details. If you already have an account, please use the Login page; otherwise choose a different username."
            : (msg || "Registration failed");
          setMessage(friendly, false);
        }
        return;
      }

      // Login flow
      setMessage(data.message || "", !!data.success);
      if (data.success) {
        showOtp(true);
      }
    })
    .catch(() => {
      setMessage("Server not reachable", false);
    })
    .finally(() => {
      isAuthBusy = false;
      setLoading(false, route);
    });
}

function verify() {
  if (isOtpBusy) return; // don't allow overlapping OTP verifications

  const codeEl = document.getElementById("otp");
  const code = (codeEl?.value || "").trim();
  if (!currentUsername || !code) {
    const guidance = currentFlow === "register"
      ? "Please enter your username and password, then click Register to request a code. After you receive it, enter the OTP here."
      : "Please enter your username and password, then click Login to request a code. After you receive it, enter the OTP here.";
    setMessage(guidance, false);
    if (codeEl) codeEl.focus();
    return;
  }

  isOtpBusy = true;
  setLoading(true, "otp");

  fetch(`${LAMBDA_URL}verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: currentUsername, code })
  })
    .then(res => res.json())
    .then(data => {
      // Keep server message but add clarity for registration
      if (data.success && currentFlow === "register") {
        setMessage(data.message || "Registration verified. You can now log in.", true);
        showOtp(false);
        return;
      }
      setMessage(data.message || "", !!data.success);
      if (data.success) {
        showOtp(false);
      }
    })
    .catch(() => {
      setMessage("Server not reachable", false);
    })
    .finally(() => {
      isOtpBusy = false;
      setLoading(false, "otp");
    });
}

// Ensure OTP section is hidden on initial load/navigation (including bfcache restores)
document.addEventListener("DOMContentLoaded", () => {
  showOtp(false);
  setMessage("", true);
});

window.addEventListener("pageshow", (e) => {
  if (e.persisted) {
    showOtp(false);
    setMessage("", true);
  }
});
