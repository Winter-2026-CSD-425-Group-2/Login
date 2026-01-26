# Simple Web Login Demo (HTML, CSS, JS)

An accessible front-end login form built for quick prototyping.

Key goals:
- Accessibility-first: semantic HTML, and labels.
- Simplicity: minimal dependencies, straightforward JS.

---

## index.html (Structure and Accessibility)

Rationale and decisions:
- Semantic elements: `<main>` groups page content; `<section>` groups the login card; `<h1>` provides page title. Improves screen-reader navigation.
- Form specifics:
  - `method="post"` to align with secure server-side submissions.
  - `action="/login"` as a placeholder. Replace with backend route.
- Inputs:
  - Email uses `type="email"`, `inputmode="email"`, `autocomplete="email"` for better UX on mobile keyboards and autofill.
  - Password uses `autocomplete="current-password"` to integrate with password managers.
  - `label` elements are associated with inputs via `for`, which is essential for accessibility.

---

## script.js (Behavior)

Rationale and decisions:
- Unobtrusive JS: all behavior is attached via event listeners; no inline handlers in HTML. This keeps markup clean and improves maintainability.
- Password toggle: button updates text when switching between Show/Hide.

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
- To implement custom submission with JS, uncomment and adapt the `fetch` example in `script.js`.

---

---

## Why These Choices?

- Intentionally small: can be read and understood quickly.
- It’s easy to graft onto any stack (Django/Flask, Express, Rails, Spring, etc.) without framework lock-in.
