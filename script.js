'use strict';
/*
  Simple login template behaviors
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
  const emailError = document.getElementById('email-error');
  const passwordError = document.getElementById('password-error');
  const formMessage = document.getElementById('form-message');
  const toggleBtn = document.getElementById('toggle-password');
  const submitBtn = document.getElementById('submit-button');

  function isValidEmail(value) {
    // Simple, pragmatic check: user@domain.tld
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function isValidPassword(value) {
    return typeof value === 'string' && value.length >= 8;
  }

  function setError(input, errorEl, message) {
    errorEl.textContent = message;
  }

  function clearError(input, errorEl) {
    errorEl.textContent = '';
  }

  function validateEmail() {
    const value = emailInput.value.trim();
    if (!value) {
      setError(emailInput, emailError, 'Please enter your email.');
      return false;
    }
    if (!isValidEmail(value)) {
      setError(emailInput, emailError, 'Please enter a valid email address.');
      return false;
    }
    clearError(emailInput, emailError);
    return true;
  }

  function validatePassword() {
    const value = passwordInput.value;
    if (!value) {
      setError(passwordInput, passwordError, 'Please enter your password.');
      return false;
    }
    if (!isValidPassword(value)) {
      setError(passwordInput, passwordError, 'Your password must be at least 8 characters.');
      return false;
    }
    clearError(passwordInput, passwordError);
    return true;
  }

  // Toggle password visibility with accessible label updates
  toggleBtn.addEventListener('click', () => {
    const hidden = passwordInput.getAttribute('type') === 'password';
    passwordInput.setAttribute('type', hidden ? 'text' : 'password');
    toggleBtn.textContent = hidden ? 'Hide' : 'Show';
  });

  // Validate on type to provide immediate feedback
  emailInput.addEventListener('input', () => {
    if (emailInput.value) validateEmail();
  });
  passwordInput.addEventListener('input', () => {
    if (passwordInput.value) validatePassword();
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    formMessage.textContent = '';

    const okEmail = validateEmail();
    const okPass = validatePassword();
    if (!okEmail || !okPass) return;

    // Prevent repeated submissions in this demo
    submitBtn.disabled = true;
    submitBtn.textContent = 'Signing in...';

    // Simulate a short network request to show UI feedback
    setTimeout(() => {
      // IMPORTANT: Front-end demo only. Replace with real logic or standard form submit.
      formMessage.textContent = 'Demo: form is valid. Replace with real submission logic.';

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
