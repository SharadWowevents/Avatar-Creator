const nodemailer = require('nodemailer');

/**
 * Send OTP via SMTP
 * @param {string} toEmail - Recipient email address
 * @param {string} otp - 6-digit OTP code
 * @param {string} recipientName - Name of the user
 */
async function sendOtpEmail(toEmail, otp, recipientName = 'Customer') {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const secure = process.env.SMTP_SECURE === 'true';
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || '"Customer Avatar Creator" <no-reply@avatarapp.com>';

  // Check if SMTP is configured
  const isSmtpConfigured = user && pass && user.trim() !== '' && pass.trim() !== '';

  if (!isSmtpConfigured) {
    console.log('--------------------------------------------------');
    console.log(`[SMTP DEV MODE] No SMTP credentials provided in backend/.env.`);
    console.log(`🔑 OTP for ${toEmail} (${recipientName}): [ ${otp} ]`);
    console.log(`Use this code to reset your password.`);
    console.log('--------------------------------------------------');
    return {
      success: true,
      devMode: true,
      message: 'SMTP not configured in .env. OTP displayed in server terminal.',
      debugOtp: otp,
    };
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass,
      },
    });

    const htmlContent = `
      <div style="font-family:'Segoe UI',Roboto,Helvetica,sans-serif;max-width:540px;margin:0 auto;padding:28px;border:1px solid #d5dde6;border-radius:12px;background:#ffffff;color:#0f1d2e;">
        <div style="border-bottom:2px solid #13294b;padding-bottom:16px;margin-bottom:20px;">
          <h2 style="margin:0;color:#13294b;font-size:22px;">Customer Avatar Creator</h2>
          <p style="margin:4px 0 0;color:#5a6878;font-size:13px;">Password Reset Verification Code</p>
        </div>
        <p>Hello <strong>${recipientName}</strong>,</p>
        <p>You recently requested to reset the password for your Customer Avatar Creator account.</p>
        <div style="margin:24px 0;text-align:center;">
          <span style="display:inline-block;letter-spacing:6px;font-size:32px;font-weight:700;background:#eef2f6;color:#13294b;padding:12px 28px;border-radius:8px;border:1px solid #d5dde6;font-family:monospace;">
            ${otp}
          </span>
        </div>
        <p style="font-size:13px;color:#5a6878;">
          This OTP is valid for <strong>15 minutes</strong>. If you did not make this request, you can safely ignore this email.
        </p>
        <hr style="border:none;border-top:1px solid #eef2f6;margin:24px 0;">
        <p style="font-size:11px;color:#93a2b3;margin:0;">WOW Events Customer Avatar Creator • Secure Authentication</p>
      </div>
    `;

    const info = await transporter.sendMail({
      from,
      to: toEmail,
      subject: `Your Password Reset OTP: ${otp}`,
      text: `Hello ${recipientName},\n\nYour OTP for resetting your password is: ${otp}\n\nThis code expires in 15 minutes.\n\nIf you did not request this, please ignore this email.`,
      html: htmlContent,
    });

    console.log(`[SMTP] OTP email sent successfully to ${toEmail}: ${info.messageId}`);
    return {
      success: true,
      devMode: false,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error(`[SMTP Error] Failed to send email to ${toEmail}:`, error.message);
    console.log(`🔑 FALLBACK OTP for ${toEmail}: [ ${otp} ]`);
    return {
      success: true,
      devMode: true,
      error: error.message,
      message: 'SMTP delivery failed. Fallback OTP provided.',
      debugOtp: otp,
    };
  }
}

module.exports = {
  sendOtpEmail,
};

