var form = document.getElementById("login-form");
var emailInput = document.getElementById("email");
var passwordInput = document.getElementById("password");
var messageBox = document.getElementById("form-message");
var toggleBtn = document.getElementById("toggle-password");

form.addEventListener("submit", function (event) {
  event.preventDefault(); // stop page reload

  var emailValue = emailInput.value;
  var passwordValue = passwordInput.value;

  messageBox.textContent = "";
  messageBox.style.color = "";

  if (emailValue === "test@test.com" && passwordValue === "12345") {
    messageBox.textContent = "Login successful ✅";
    messageBox.style.color = "green";
  } else {
    messageBox.textContent = "Invalid email or password ❌";
    messageBox.style.color = "red";
  }
});

toggleBtn.addEventListener("click", function () {
  if (passwordInput.type === "password") {
    passwordInput.type = "text";
    toggleBtn.textContent = "Hide";
  } else {
    passwordInput.type = "password";
    toggleBtn.textContent = "Show";
  }
});
