'use strict';
/*
  Simple login demo behaviors
  Goals:
  - Accessible password show/hide toggle
  - Lightweight client-side validation (email + password length)
  - Clear, non-intrusive feedback
  - No credential logging; safe front-end demo
*/

(function () {
  const form = document.getElementById('login-form');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const formMessage = document.getElementById('form-message');
  const toggleBtn = document.getElementById('toggle-password');
  const submitBtn = document.getElementById('submit-button');

  // Toggle password visibility with accessible label updates
  toggleBtn.addEventListener('click', () => {
    const hidden = passwordInput.getAttribute('type') === 'password';
    passwordInput.setAttribute('type', hidden ? 'text' : 'password');
    toggleBtn.textContent = hidden ? 'Hide' : 'Show';
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    formMessage.textContent = '';

    if (!okEmail || !okPass) return;

    // Prevent repeated submissions in this demo
    submitBtn.disabled = true;
    submitBtn.textContent = 'Signing in...';

    // Simulate a short network request to show UI feedback
    setTimeout(() => {
      // IMPORTANT: Front-end demo only. Replace with real logic or standard form submit.
      if (emailInput.value == "user@example.com" && passwordInput.value == "password") {
        formMessage.textContent = 'Successfully logged in.';
      }
      else {
        formMessage.textContent = 'Incorrect username or password';
      }

      // Re-enable button after demo completes
      submitBtn.disabled = false;
      submitBtn.textContent = 'Sign in';

      // Example integration pattern (commented):
      // fetch('/login', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     email: emailInput.value.trim(),
      //     password: passwordInput.value,
      //     remember: document.getElementById('remember').checked,
      //   })
      // })
      // .then(async (res) => {
      //   if (!res.ok) throw new Error('Login failed');
      //   // Navigate on success
      //   window.location.assign('/dashboard');
      // })
      // .catch((err) => {
      //   passwordInput.value = '';
      //   setError(passwordInput, passwordError, 'Invalid credentials, please try again.');
      //   formMessage.textContent = '';
      // });
    }, 800);
  });
})();
