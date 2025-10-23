require('dotenv').config();
const nodemailer = require('nodemailer');

async function main() {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.FROM_EMAIL || user;

  if (!host || !port || !user || !pass) {
    console.error('SMTP environment variables not set. Check server/.env');
    process.exit(1);
  }

  const transporter = nodemailer.createTransport({
    host,
    port: parseInt(port, 10),
    secure: parseInt(port, 10) === 465,
    auth: {
      user,
      pass,
    },
  });

  const to = process.argv[2] || user;

  try {
    console.log(`Sending test email from=${from} to=${to} via ${host}:${port}`);
    const info = await transporter.sendMail({
      from,
      to,
      subject: 'AI-create-CV — Test email',
      text: 'This is a test email sent by the AI-create-CV mail test script.',
      html: '<p>This is a test email sent by the <strong>AI-create-CV</strong> mail test script.</p>',
    });
    console.log('Message sent:', info.messageId || info.response);
    process.exit(0);
  } catch (err) {
    console.error('Failed to send test email:', err);
    process.exit(2);
  }
}

main();
