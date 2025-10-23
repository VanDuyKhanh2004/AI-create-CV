require('dotenv').config();
const nodemailer = require('nodemailer');

const to = process.argv[2];
if (!to) {
  console.error('Usage: node send_welcome_to.js <email>');
  process.exit(1);
}

async function send() {
  const SMTP_HOST = process.env.SMTP_HOST;
  const SMTP_PORT = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : undefined;
  const SMTP_USER = process.env.SMTP_USER;
  const SMTP_PASS = process.env.SMTP_PASS;
  const FROM_EMAIL = process.env.FROM_EMAIL || SMTP_USER;

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    console.error('SMTP credentials not fully set; check .env');
    process.exit(1);
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS }
  });

  const html = `
  <div style="font-family:Arial,Helvetica,sans-serif;color:#222">
    <h3>Xin chào,</h3>
    <p>Chào mừng bạn đến với AI create CV — tài khoản của bạn đã được kích hoạt.</p>
    <p><a href="${process.env.CLIENT_URL || 'http://localhost:3000'}">Bắt đầu tạo CV</a></p>
  </div>
  `;

  try {
    const info = await transporter.sendMail({ from: FROM_EMAIL, to, subject: 'Chào mừng đến với AI create CV', html, text: 'Chào mừng bạn đến với AI create CV' });
    console.log('Welcome message sent:', info.messageId || info.response);
  } catch (e) {
    console.error('Failed to send welcome message', e);
  }
}

send();
