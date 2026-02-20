const LAMBDA_URL = "https://bgrsmxb6sncxgulfimnep5sz6y0mjbkv.lambda-url.us-east-2.on.aws/";

function login() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const message = document.getElementById("message");

  fetch(`${LAMBDA_URL}login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ username, password })
  })
    .then(res => res.json())
    .then(data => {
      message.style.color = data.success ? "green" : "red";
      message.textContent = data.message;
    })
    .catch(err => {
      message.style.color = "red";
      message.textContent = "Server not reachable";
    });
}
