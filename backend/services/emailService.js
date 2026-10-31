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
  const from = process.env.SMTP_FROM || '"Customer Avatar Creator" <hello@wowos.in>';

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
      connectionTimeout: 4000,
      greetingTimeout: 4000,
      socketTimeout: 6000,
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

/**
 * Send Generated Avatar Dossier Email with PDF Attachment
 * To: user email
 * BCC: sachin@wowos.in (Sir)
 *
 * @param {Object} options
 * @param {string} options.toEmail - User's email address
 * @param {string} options.recipientName - User's name
 * @param {Buffer} options.pdfBuffer - Generated PDF buffer
 * @param {string} options.pdfFilename - Filename for attachment
 * @param {string} options.lifeboatName - Lifeboat character name
 * @param {string} options.yachtName - Yacht character name
 */
async function sendAvatarDossierEmail({
  toEmail,
  recipientName = 'Customer',
  pdfBuffer,
  pdfFilename = 'Customer_Avatar_Dossier.pdf',
  lifeboatName = 'Lifeboat Avatar',
  yachtName = 'Yacht Avatar',
}) {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const secure = process.env.SMTP_SECURE === 'true';
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || '"WOWOS Avatar Creator" <hello@wowos.in>';
  const bcc = process.env.ADMIN_BCC_EMAIL || process.env.BCC_EMAIL || 'sachin@wowos.in';

  // Check if SMTP is configured
  const isSmtpConfigured = user && pass && user.trim() !== '' && pass.trim() !== '';

  if (!toEmail) {
    console.warn('[SMTP Warning] No recipient email provided for avatar dossier delivery.');
    return { success: false, message: 'No recipient email provided' };
  }

  const plainText = `Dear ${recipientName},\n\nhere is your customer avatar\n\nAttached is your complete Customer Avatar Dossier PDF featuring:\n- Lifeboat Customer: ${lifeboatName}\n- Yacht Customer: ${yachtName}\n- Strategic Bridge Strategy to serve both\n\nBest regards,\nWOW Events Team`;

  const htmlContent = `
    <div style="font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;max-width:600px;margin:0 auto;padding:32px 24px;border:1px solid #d5dde6;border-radius:12px;background:#ffffff;color:#0f1d2e;">
      <!-- Header -->
      <div style="border-bottom:2px solid #13294b;padding-bottom:16px;margin-bottom:24px;">
        <h2 style="margin:0;color:#13294b;font-size:22px;letter-spacing:-0.5px;">Customer Avatar Creator</h2>
        <p style="margin:4px 0 0;color:#5a6878;font-size:13px;">Dossier & Strategic Action Plan</p>
      </div>

      <!-- Salutation & Message requested by user -->
      <p style="font-size:16px;line-height:1.5;margin:0 0 8px;">
        Dear <strong>${recipientName}</strong>,
      </p>
      <p style="font-size:16px;line-height:1.5;color:#13294b;font-weight:600;margin:0 0 20px;">
        here is your customer avatar
      </p>

      <!-- Highlights Card -->
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:20px;margin-bottom:24px;">
        <h3 style="margin:0 0 12px;color:#13294b;font-size:15px;text-transform:uppercase;letter-spacing:0.5px;">
          Generated Personas Included:
        </h3>
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <tr>
            <td style="padding:8px 0;color:#e8590c;font-weight:700;width:140px;">• Lifeboat Avatar:</td>
            <td style="padding:8px 0;color:#0f1d2e;"><strong>${lifeboatName}</strong> (Immediate Rescue & Urgency)</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#0b7a75;font-weight:700;width:140px;">• Yacht Avatar:</td>
            <td style="padding:8px 0;color:#0f1d2e;"><strong>${yachtName}</strong> (Status, Scaling & Ambition)</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#13294b;font-weight:700;width:140px;">• Serve Both:</td>
            <td style="padding:8px 0;color:#0f1d2e;">Two-speed strategic bridge & journey ladder</td>
          </tr>
        </table>
      </div>

      <!-- PDF Attachment Notice -->
      <div style="border-left:4px solid #13294b;background:#eef2f6;padding:14px 18px;border-radius:0 8px 8px 0;margin-bottom:24px;">
        <p style="margin:0;font-size:14px;color:#13294b;">
          📎 <strong>Attachment:</strong> Your full 3-page, publication-ready PDF (<code>${pdfFilename}</code>) has been attached to this email for quick review, offline printing, or sharing with your leadership team.
        </p>
      </div>

      <hr style="border:none;border-top:1px solid #eef2f6;margin:28px 0 16px;">
      
      <p style="font-size:12px;color:#5a6878;margin:0 0 4px;">
        Sent to <strong>${toEmail}</strong> (BCC: ${bcc})
      </p>
      <p style="font-size:11px;color:#93a2b3;margin:0;">
        WOW Events Customer Avatar Creator • All rights reserved
      </p>
    </div>
  `;

  if (!isSmtpConfigured) {
    console.log('--------------------------------------------------');
    console.log(`[SMTP DEV MODE] Avatar PDF email ready for ${toEmail}`);
    console.log(`📬 To: ${toEmail}`);
    console.log(`🔒 BCC: ${bcc}`);
    console.log(`📎 Attachment: ${pdfFilename} (${pdfBuffer ? pdfBuffer.length : 0} bytes)`);
    console.log(`Message: Dear ${recipientName}, here is your customer avatar`);
    console.log('--------------------------------------------------');
    return {
      success: true,
      devMode: true,
      message: 'SMTP credentials not configured. Avatar email simulated in server log.',
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
      connectionTimeout: 4000,
      greetingTimeout: 4000,
      socketTimeout: 6000,
    });

    const mailOptions = {
      from,
      to: toEmail,
      bcc,
      subject: `Here is your customer avatar: ${lifeboatName} & ${yachtName}`,
      text: plainText,
      html: htmlContent,
      attachments: pdfBuffer
        ? [
            {
              filename: pdfFilename,
              content: pdfBuffer,
              contentType: 'application/pdf',
            },
          ]
        : [],
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[SMTP Success] Customer avatar email sent to ${toEmail} (BCC: ${bcc}): ${info.messageId}`);
    return {
      success: true,
      devMode: false,
      messageId: info.messageId,
      to: toEmail,
      bcc,
    };
  } catch (error) {
    console.error(`[SMTP Error] Failed to send avatar email to ${toEmail}:`, error.message);
    return {
      success: false,
      error: error.message,
      message: `Failed to deliver email: ${error.message}`,
    };
  }
}

module.exports = {
  sendOtpEmail,
  sendAvatarDossierEmail,
};
