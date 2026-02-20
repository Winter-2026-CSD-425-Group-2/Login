const LAMBDA_URL = "https://bgrsmxb6sncxgulfimnep5sz6y0mjbkv.lambda-url.us-east-2.on.aws/";

const login = () => auth("login");
const register = () => auth("register");

function auth(route) {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const message = document.getElementById("message");

  fetch(`${LAMBDA_URL}${route}`, {
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
