// Hardcoded test user
const correctUsername = "student";
const correctPassword = "1234";

function login() {
  const userInput = document.getElementById("username").value;
  const passInput = document.getElementById("password").value;
  const message = document.getElementById("message");

  if (userInput === correctUsername && passInput === correctPassword) {
    message.style.color = "green";
    message.textContent = "Login successful! Welcome 🎉";
  } else {
    message.style.color = "red";
    message.textContent = "Invalid username or password ❌";
  }
}
