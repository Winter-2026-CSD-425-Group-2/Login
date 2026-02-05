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
  const emailError = document.getElementById('email-error');
  const passwordError = document.getElementById('password-error');
  const formMessage = document.getElementById('form-message');
  const toggleBtn = document.getElementById('toggle-password');
  const submitBtn = document.getElementById('submit-button');

  // API base URL: set window.API_BASE in index.html for production.
  // Defaults to localhost for local development.
  const API_BASE = (typeof window !== 'undefined' && window.API_BASE)
    ? window.API_BASE
    : 'http://localhost:5000';

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

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    formMessage.textContent = '';

    const okEmail = validateEmail();
    const okPass = validatePassword();
    if (!okEmail || !okPass) return;

    // Prevent repeated submissions in this demo
    submitBtn.disabled = true;
    submitBtn.textContent = 'Signing in...';

    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailInput.value.trim(),
          password: passwordInput.value,
          remember: document.getElementById('remember').checked,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        passwordInput.value = '';
        setError(passwordInput, passwordError, data?.error || 'Invalid credentials, please try again.');
        formMessage.textContent = '';
        return;
      }

      // Success
      clearError(passwordInput, passwordError);
      formMessage.textContent = data?.message || 'Successfully logged in.';
    } catch (err) {
      passwordInput.value = '';
      setError(passwordInput, passwordError, 'Network error, please try again.');
      formMessage.textContent = '';
    } finally {
      // Re-enable button after request completes
      submitBtn.disabled = false;
      submitBtn.textContent = 'Sign in';
    }
  });
})();
