const nodemailer = require("nodemailer");

/**
 * Creates and configures the Nodemailer transporter.
 * If user hasn't set up SMTP credentials in .env yet, creates an Ethereal test account or prints the link to console.
 */
let transporter = null;

async function getTransporter() {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST || (process.env.EMAIL_USER && process.env.EMAIL_USER.includes('@gmail.com') ? 'smtp.gmail.com' : null);
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
  const port = parseInt(process.env.SMTP_PORT || '587');

  if (host && user && pass) {
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // true for 465, false for 587
      auth: { user, pass }
    });
    console.log(`[EmailService] Configured live SMTP transporter (${host}:${port}) for ${user}`);
    return transporter;
  }

  // Fallback: Test account with Ethereal if no SMTP credentials provided
  try {
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
    console.log(`[EmailService] No SMTP credentials in .env. Initialized Ethereal test inbox: ${testAccount.user}`);
    return transporter;
  } catch (err) {
    console.warn(`[EmailService] Could not initialize Ethereal transport: ${err.message}. Emails will be logged to console.`);
    return null;
  }
}

/**
 * Sends a stylized password reset email.
 * @param {string} to - Recipient email
 * @param {string} resetUrl - Password reset URL containing token
 * @param {string} recipientName - Name of the user
 */
async function sendPasswordResetEmail(to, resetUrl, recipientName = "Learner") {
  const mailTransport = await getTransporter();
  const from = process.env.EMAIL_FROM || process.env.SMTP_USER || process.env.EMAIL_USER || '"Ancora DSA Tracker" <no-reply@ancora.dev>';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Reset Your Ancora Password</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0B0F17; color: #E2E8F0; margin: 0; padding: 24px; }
        .card { max-width: 520px; margin: 0 auto; background: #131B2E; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 16px; padding: 36px 32px; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5); }
        .logo { font-size: 20px; font-weight: 800; color: #818CF8; letter-spacing: -0.5px; margin-bottom: 24px; display: inline-block; }
        h1 { font-size: 22px; font-weight: 700; color: #FFFFFF; margin-top: 0; margin-bottom: 12px; }
        p { font-size: 14.5px; line-height: 1.6; color: #94A3B8; margin-bottom: 20px; }
        .btn { display: inline-block; background: linear-gradient(135deg, #6366F1 0%, #4F46E5 100%); color: #FFFFFF !important; font-weight: 600; font-size: 14px; text-decoration: none; padding: 12px 28px; border-radius: 8px; margin: 12px 0 24px 0; }
        .link-alt { font-size: 12px; color: #64748B; word-break: break-all; margin-top: 20px; }
        .footer { font-size: 11.5px; color: #475569; margin-top: 32px; border-top: 1px solid rgba(255, 255, 255, 0.06); padding-top: 16px; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="logo">⚡ Ancora DSA</div>
        <h1>Reset your password</h1>
        <p>Hello ${recipientName},</p>
        <p>We received a request to reset your Ancora account password. Click the button below to choose a new password. This link is valid for <strong>1 hour</strong>.</p>
        <div>
          <a href="${resetUrl}" class="btn" target="_blank">Reset Password</a>
        </div>
        <p style="font-size: 13px; color: #64748B;">If you didn't request a password reset, you can safely ignore this email. Your current password remains unchanged.</p>
        <div class="link-alt">
          Can't click the button? Copy and paste this URL into your browser:<br />
          <a href="${resetUrl}" style="color: #818CF8;">${resetUrl}</a>
        </div>
        <div class="footer">
          © ${new Date().getFullYear()} Ancora DSA Tracker. Master algorithmic patterns with deliberate practice.
        </div>
      </div>
    </body>
    </html>
  `;

  const textContent = `Hello ${recipientName},\n\nYou requested a password reset for Ancora DSA Tracker.\nUse the following link to reset your password (valid for 1 hour):\n${resetUrl}\n\nIf you did not request this, please ignore this email.\n`;

  console.log(`\n=============================================================`);
  console.log(`📬 [PASSWORD RESET EMAIL FOR ${to}]`);
  console.log(`🔗 Reset URL: ${resetUrl}`);
  console.log(`=============================================================\n`);

  if (!mailTransport) {
    return { success: true, message: "Email logged to console" };
  }

  const info = await mailTransport.sendMail({
    from,
    to,
    subject: "Reset your Ancora DSA Tracker password",
    text: textContent,
    html: htmlContent
  });

  // If using Ethereal, log the preview URL
  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) {
    console.log(`📧 [Ethereal Preview URL]: ${previewUrl}`);
  }

  return { success: true, messageId: info.messageId, previewUrl };
}

module.exports = {
  sendPasswordResetEmail,
  getTransporter
};
