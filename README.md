# Simple Web Login Template (HTML, JS)

This template provides a clean, accessible, and responsive front-end login form. It is designed for teaching and quick prototyping, with sensible defaults and clear documentation.

Key goals:
- Accessibility-first: semantic HTML, and labels.
- Progressive enhancement: works without JS; improves feedback when JS is enabled.
- Simplicity: minimal dependencies, straightforward JS, no included CSS styling.

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
  - `action="/login"` as a placeholder. Replace with your backend route.
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

## How to Use This Template

- Open `index.html` in your browser to view the form.
- Create a stylesheet in `styles.css`.
- Replace `action` in `index.html` with your backend endpoint.
- To implement custom submission with JS, uncomment and adapt the `fetch` example in `script.js`.

---

## Extensions and Exercises (Educational)

- Add username-based login and toggle between email/username.
- Include a "Remember me" feature backed by server-set cookies; avoid localStorage for sensitive data.
- Internationalize labels and messages.
- Build a registration page with the same pattern (labels, validation).

---

## Why These Choices?

- The template is intentionally small: students can read and understand all of it quickly.
- It’s easy to graft onto any stack (Django/Flask, Express, Rails, Spring, etc.) without framework lock-in.

Happy learning and building!
