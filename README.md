# Simple Web Login Template (HTML, JS)

This template provides a clean, accessible, and responsive front-end login form. It is designed for teaching and quick prototyping, with sensible defaults and clear documentation.

Key goals:
- Accessibility-first: semantic HTML, labels, focus states, and aria-live feedback.
- Progressive enhancement: works without JS; improves feedback when JS is enabled.
- Simplicity: minimal dependencies, straightforward JS, no included CSS styling.

---

## Project Structure

- `index.html` — Semantic markup for the login form with helpful ARIA attributes.
- `script.js` — Unobtrusive behavior: password toggling, lightweight validation, and user feedback.

---

## index.html (Structure and Accessibility)

Rationale and decisions:
- Semantic elements: `<main>` groups page content; `<section>` groups the login card; `<h1>` provides page title. Improves screen-reader navigation.
- Form specifics:
  - `method="post"` to align with secure server-side submissions.
  - `action="/login"` as a placeholder. Replace with your backend route.
  - `novalidate` intentionally added to demonstrate custom validation and consistent styling. Remove it to rely on native browser validation if desired.
- Inputs:
  - Email uses `type="email"`, `inputmode="email"`, `autocomplete="email"` for better UX on mobile keyboards and autofill.
  - Password uses `autocomplete="current-password"` to integrate with password managers.
  - `label` elements are associated with inputs via `for`, which is essential for accessibility.
  - Error and helper messages are connected with `aria-describedby` for context.
  - `aria-invalid` toggled by JS to communicate validation state to assistive tech.
- Feedback:
  - Error messages use `role="alert"` with `aria-live="polite"` to announce changes without being disruptive.
  - A general `form-message` region with `role="status"` provides non-error feedback (e.g., "Signing in...").
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
  - Accessibility: `aria-invalid` toggled; error messages in `aria-live` regions are announced to screen readers.
- Password toggle: button updates text and `aria-label` when switching between Show/Hide to remain accessible.
- Feedback: disables submit briefly and shows status text to simulate a network request without exposing credentials.

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

## How to Use This Template

- Open `index.html` in your browser to view the form.
- Create a stylesheet in `styles.css`.
- Replace `action` in `index.html` with your backend endpoint.
- If you prefer built-in browser validation, remove `novalidate` from the `<form>`.
- To implement custom submission with JS, uncomment and adapt the `fetch` example in `script.js`.

---

## Extensions and Exercises (Educational)

- Add username-based login and toggle between email/username.
- Include a "Remember me" feature backed by server-set cookies; avoid localStorage for sensitive data.
- Internationalize labels and messages; ensure ARIA attributes remain accurate.
- Implement a loading spinner with `prefers-reduced-motion` support.
- Add unit tests for validation helpers.
- Build a registration page with the same pattern (labels, validation, aria-live).

---

## Why These Choices?

- Accessibility and usability are prioritized to teach best practices.
- The template is intentionally small: students can read and understand all of it quickly.
- It’s easy to graft onto any stack (Django/Flask, Express, Rails, Spring, etc.) without framework lock-in.

Happy learning and building!
