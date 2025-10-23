Email setup for AI create CV server

This project can send welcome emails on first login/registration. To enable email sending, set the following environment variables in `server/.env`:

- SMTP_HOST - your SMTP server host (e.g., smtp.gmail.com)
- SMTP_PORT - SMTP port (587 for TLS, 465 for SSL)
- SMTP_USER - SMTP username (email account)
- SMTP_PASS - SMTP password or app-specific password
- FROM_EMAIL - (optional) from address shown to recipients (defaults to SMTP_USER)

How to test locally
1. Install nodemailer (already added):
   cd server
   npm install

2. Add credentials to `server/.env`:
   SMTP_HOST=smtp.example.com
   SMTP_PORT=587
   SMTP_USER=your@example.com
   SMTP_PASS=yourpassword
   FROM_EMAIL=Your Name <your@example.com>

3. Start server and register or login a user for the first time. The server will attempt to send a welcome email in the background. Check server logs for send result.

Notes
- For Gmail, you might need an app password and to enable "less secure apps" or use OAuth2.
- If you don't want to send real emails during development, consider using a service like Mailtrap (https://mailtrap.io) or Ethereal (nodemailer test accounts).
