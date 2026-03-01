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
  if (section) section.style.display = show ? "block" : "none";
}

function auth(route) {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;

  currentUsername = username;
  currentPassword = password;

  showOtp(false);
  setMessage("", true);

  fetch(`${LAMBDA_URL}${route}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  })
    .then(res => res.json())
    .then(async data => {
      setMessage(data.message || "", !!data.success);

      if (!data.success) return;

      if (route === "login") {
        // Login triggers OTP via AWS SES; show OTP input.
        showOtp(true);
      } else if (route === "register") {
        // After successful registration, automatically trigger login to send OTP.
        setMessage("User created successfully. Sending OTP to your email...", true);
        try {
          const res2 = await fetch(`${LAMBDA_URL}login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: currentUsername, password: currentPassword })
          });
          const data2 = await res2.json();
          setMessage(data2.message || "", !!data2.success);
          if (data2.success) showOtp(true);
        } catch (e) {
          setMessage("Could not send OTP after registration", false);
        }
      }
    })
    .catch(() => {
      setMessage("Server not reachable", false);
    });
}

function verify() {
  const code = document.getElementById("otp").value.trim();
  if (!currentUsername || !code) {
    setMessage("Please enter your username/password and the OTP code.", false);
    return;
  }

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
    });
}
