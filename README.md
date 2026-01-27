# Simple Web Login Demo (HTML, CSS, JS)

An accessible front-end login form built for quick prototyping.

Key goals:
- Accessibility-first: semantic HTML, and labels.
- Progressive enhancement: works without JS; improves feedback when JS is enabled.
- Simplicity: minimal dependencies, straightforward JS.

---

## Project Structure

- `index.html` — Semantic markup for the login form.
- `script.js` — Unobtrusive behavior: password toggling, lightweight validation, and user feedback.

---

## index.html (Structure and Accessibility)

Rationale and decisions:
- Semantic elements: `<main>` groups page content; `<section>` groups the login card; `<h1>` provides page title. Improves screen-reader navigation.
- Form specifics:
  - `method="post"` to align with secure server-side submissions.
  - `action="/login"` as a placeholder. Replace with backend route.
  - `novalidate` intentionally added to demonstrate custom validation and consistent styling. Remove it to rely on native browser validation if desired.
- Inputs:
  - Email uses `type="email"`, `inputmode="email"`, `autocomplete="email"` for better UX on mobile keyboards and autofill.
  - Password uses `autocomplete="current-password"` to integrate with password managers.
  - `label` elements are associated with inputs via `for`, which is essential for accessibility.
- Progressive enhancement:
  - The form remains functional without JavaScript (it will submit to the server). With JS, users receive immediate client-side feedback.

Trade-offs:
- Using `novalidate` ensures consistent styling but bypasses native validation UI. It improves customization at the cost of built-in browser behaviors.

---

## script.js (Behavior and Validation)

Rationale and decisions:
- Unobtrusive JS: all behavior is attached via event listeners; no inline handlers in HTML. This keeps markup clean and improves maintainability.
- Validation:
  - Email: pragmatic regex ensures `user@domain.tld` shape; adequate for client-side checks.
  - Password: minimum length check (8). Stronger policies should be enforced by the server.
- Password toggle: button updates text when switching between Show/Hide.

Integration guidance:
- For real submissions, either:
  1. Remove `novalidate` and let the browser validate, then rely on standard form submission (`action` and `method`).
  2. Keep `novalidate` and call your API with `fetch`. On error, clear the password field, set an error message, and keep overall feedback in `form-message`.

Security notes:
- Never log passwords or store them client-side.
- Always use HTTPS in production.
- Implement server-side validation and rate limiting.
- Use secure cookies (`HttpOnly`, `Secure`, `SameSite`) for sessions.
- Consider CSRF protection for form submissions.

---

## How to Use

- Open `index.html` in your browser to view the form.
- Replace `action` in `index.html` with your backend endpoint.
- If you prefer built-in browser validation, remove `novalidate` from the `<form>`.
- To implement custom submission with JS, uncomment and adapt the `fetch` example in `script.js`.

---

---

## Why These Choices?

- Intentionally small: can be read and understood quickly.
- It’s easy to graft onto any stack (Django/Flask, Express, Rails, Spring, etc.) without framework lock-in.
