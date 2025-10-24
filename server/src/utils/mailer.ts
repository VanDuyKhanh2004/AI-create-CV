import nodemailer from 'nodemailer';

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : undefined;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const FROM_EMAIL = process.env.FROM_EMAIL || SMTP_USER;

let transporter: any = null;

export const getTransporter = () => {
  if (transporter) return transporter;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    console.warn('SMTP credentials not fully set; emails will not be sent');
    return null;
  }
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465, // true for 465, false for other ports
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
  return transporter;
};

export const sendWelcomeEmail = async (to: string, name?: string) => {
  const t = getTransporter();
  if (!t) return false;

  const displayName = name ? escapeHtml(name) : 'Bạn';
  const CTA_URL = process.env.CLIENT_URL || 'http://localhost:3000';

  const html = `
  <!doctype html>
  <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width,initial-scale=1">
      <style>
        body {font-family: -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial; margin:0; padding:0; background:#f4f6f8}
        .container {max-width:600px; margin:24px auto;background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 4px 18px rgba(0,0,0,0.08)}
        .header {background:linear-gradient(90deg,#2e7d32,#43a047); padding:22px; color:white;}
        .logo {font-weight:800; font-size:20px}
        .hero {padding:28px 26px}
        .greeting {font-size:20px; font-weight:700; margin:0 0 8px}
        .lead {color:#555; margin:0 0 16px; line-height:1.6}
        .features {padding:18px 26px; border-top:1px solid #f0f0f0}
        .feature {display:flex; gap:12px; margin-bottom:12px}
        .feature .dot {width:10px;height:10px;background:#1b5e20;border-radius:50%;margin-top:6px}
        .footer {padding:16px 26px; font-size:12px; color:#888; border-top:1px solid #f0f0f0}
        /* Button styles as inline fallback for email clients */
        .btn-td { border-radius:8px; background:#1b5e20; }
        .btn-a { display:inline-block; padding:14px 20px; color:#ffffff; text-decoration:none; font-weight:700; font-size:16px; border-radius:8px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">AI create CV</div>
        </div>
        <div class="hero">
          <p class="greeting">Xin chào ${displayName},</p>
          <p class="lead">Chào mừng bạn đến với AI create CV — nơi giúp bạn tạo CV chuyên nghiệp chỉ trong vài phút. Chúng tôi đã kích hoạt tài khoản của bạn và sẵn sàng hỗ trợ.</p>
          <!-- Button as a table to improve rendering across email clients -->
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin: 10px 0 18px;">
            <tr>
              <td class="btn-td" align="center">
                <a class="btn-a" href="${CTA_URL}" target="_blank" style="background:#1b5e20;color:#fff;display:inline-block;padding:14px 20px;border-radius:8px;font-weight:700;text-decoration:none;">Bắt đầu tạo CV</a>
              </td>
            </tr>
          </table>
          <p style="font-size:13px;color:#666;margin-top:6px;">Hoặc mở liên kết: <a href="${CTA_URL}" target="_blank" style="color:#1976d2">${CTA_URL}</a></p>
        </div>
        <div class="features">
          <div class="feature"><div class="dot"></div><div><strong>Mẫu CV chuyên nghiệp</strong><div class="muted">Chọn mẫu đẹp, tương thích ATS</div></div></div>
          <div class="feature"><div class="dot"></div><div><strong>Tự động gợi ý nội dung</strong><div class="muted">AI gợi ý mô tả kinh nghiệm, kỹ năng</div></div></div>
          <div class="feature"><div class="dot"></div><div><strong>Tải xuống PDF</strong><div class="muted">Xuất file PDF đẹp giống mẫu</div></div></div>
        </div>
        <div class="footer">Nếu bạn không yêu cầu email này, vui lòng bỏ qua. © ${new Date().getFullYear()} AI create CV</div>
      </div>
    </body>
  </html>
  `;

  const text = `Xin chao ${name || ''},\n\nChao mung ban den voi AI create CV. Bat dau tao CV: ${CTA_URL}\n\n--\nAI create CV`;

  try {
    await t.sendMail({
      from: FROM_EMAIL,
      to,
      subject: 'Chào mừng đến với AI create CV 🎉',
      text,
      html,
    });
    return true;
  } catch (err) {
    console.error('Failed to send welcome email', err);
    return false;
  }
};

export const sendVerificationEmail = async (to: string, token: string, name?: string) => {
  const t = getTransporter();
  if (!t) return false;
  const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';
  const verifyUrl = `${CLIENT_URL}/auth/verify-email?token=${encodeURIComponent(token)}`;

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;color:#222">
      <h3>Xin chào ${escapeHtml(name || '')}</h3>
      <p>Hãy xác nhận địa chỉ email của bạn bằng cách nhấn nút bên dưới:</p>
      <a href="${verifyUrl}" style="display:inline-block;padding:10px 14px;background:#1976d2;color:#fff;border-radius:6px;text-decoration:none">Xác nhận email</a>
      <p>Nếu bạn không yêu cầu, bỏ qua email này.</p>
    </div>
  `;

  try {
    await t.sendMail({ from: FROM_EMAIL, to, subject: 'Xác nhận email tại AI create CV', html });
    return true;
  } catch (err) {
    console.error('Failed to send verification email', err);
    return false;
  }
};

export const sendResetPasswordEmail = async (to: string, token: string, name?: string) => {
  const t = getTransporter();
  if (!t) return false;
  const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';
  const resetUrl = `${CLIENT_URL}/reset-password?token=${encodeURIComponent(token)}`;

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;color:#222">
      <h3>Xin chào ${escapeHtml(name || '')}</h3>
      <p>Bạn (hoặc ai đó) đã yêu cầu đặt lại mật khẩu cho tài khoản của bạn. Nhấn nút bên dưới để đặt lại mật khẩu. Link sẽ hết hạn sau 1 giờ.</p>
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin: 10px 0 18px;">
        <tr>
          <td style="border-radius:6px;background:#d32f2f;padding:8px 10px;">
            <a href="${resetUrl}" style="color:#fff;text-decoration:none;font-weight:700;display:inline-block;padding:10px 14px;border-radius:6px;">Đặt lại mật khẩu</a>
          </td>
        </tr>
      </table>
      <p>Nếu bạn không yêu cầu, hãy bỏ qua email này.</p>
    </div>
  `;

  const text = `Để đặt lại mật khẩu, hãy mở: ${resetUrl}\nLink hết hạn sau 1 giờ.`;

  try {
    await t.sendMail({ from: FROM_EMAIL, to, subject: 'Đặt lại mật khẩu - AI create CV', text, html });
    return true;
  } catch (err) {
    console.error('Failed to send reset password email', err);
    return false;
  }
};

function escapeHtml(s: any) {
  if (!s) return '';
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

export default { getTransporter, sendWelcomeEmail };
