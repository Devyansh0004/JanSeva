const nodemailer = require('nodemailer');
const logger = require('./logger');

const PLACEHOLDER_SMTP_PASS = 'your_gmail_app_password';

/**
 * Create a reusable nodemailer transporter using Gmail SMTP.
 * Returns null if SMTP credentials are not configured.
 */
const createTransporter = () => {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass || pass === PLACEHOLDER_SMTP_PASS) {
    return null;
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  });
};

/**
 * Send a beautifully formatted OTP email to the user.
 * @param {string} toEmail - Recipient email
 * @param {string} otpCode - 6-digit OTP (plain text)
 * @param {string} userName - User's name for personalization
 * @returns {Promise<boolean>} true if sent, false if SMTP not configured
 */
const sendOtpEmail = async (toEmail, otpCode, userName) => {
  const transporter = createTransporter();

  if (!transporter) {
    logger.error('SMTP not configured. Cannot send OTP email.');
    return false;
  }

  const htmlContent = `
  <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e8f5e9;">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #2d6a4f, #40916c); padding: 32px 28px; text-align: center;">
      <h1 style="margin: 0; color: #d8f3dc; font-size: 26px; font-weight: 800; letter-spacing: -1px;">
        Jan<span style="color: #95d5b2;">Seva</span>
      </h1>
      <p style="margin: 6px 0 0; color: rgba(216,243,220,0.7); font-size: 11px; text-transform: uppercase; letter-spacing: 2px; font-weight: 700;">
        Email Verification
      </p>
    </div>

    <!-- Body -->
    <div style="padding: 36px 28px;">
      <p style="margin: 0 0 8px; color: #1b4332; font-size: 18px; font-weight: 700;">
        Hello ${userName || 'there'} 👋
      </p>
      <p style="margin: 0 0 28px; color: #5f7f72; font-size: 14px; line-height: 1.7;">
        Thank you for joining JanSeva! To complete your registration, please use the verification code below. This code is valid for <strong>5 minutes</strong>.
      </p>

      <!-- OTP Box -->
      <div style="background: linear-gradient(135deg, #f6fcf7, #edf8ef); border: 2px dashed #95d5b2; border-radius: 14px; padding: 24px; text-align: center; margin-bottom: 28px;">
        <p style="margin: 0 0 8px; color: #5f7f72; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; font-weight: 700;">
          Your Verification Code
        </p>
        <p style="margin: 0; color: #1b4332; font-size: 38px; font-weight: 800; letter-spacing: 10px; font-family: 'Courier New', monospace;">
          ${otpCode}
        </p>
      </div>

      <p style="margin: 0 0 6px; color: #5f7f72; font-size: 13px; line-height: 1.7;">
        ⚠️ If you did not request this code, please ignore this email. Do not share this code with anyone.
      </p>
    </div>

    <!-- Footer -->
    <div style="background: #f6fcf7; padding: 20px 28px; border-top: 1px solid #e8f5e9; text-align: center;">
      <p style="margin: 0; color: #7c968b; font-size: 12px;">
        © ${new Date().getFullYear()} JanSeva — Smart Resource Allocation for NGOs
      </p>
      <p style="margin: 4px 0 0; color: #95d5b2; font-size: 11px;">
        IIT Patna, Bihta, Bihar - 801106, India
      </p>
    </div>
  </div>
  `;

  const textContent = `
Hello ${userName || 'there'},

Your JanSeva email verification code is: ${otpCode}

This code is valid for 5 minutes. If you did not request this, please ignore this email.

— JanSeva Team
  `.trim();

  try {
    await transporter.sendMail({
      from: `"JanSeva" <${process.env.SMTP_USER}>`,
      to: toEmail,
      subject: `${otpCode} — Your JanSeva Verification Code`,
      text: textContent,
      html: htmlContent,
    });

    logger.info(`OTP email sent to ${toEmail}`);
    return true;
  } catch (error) {
    logger.error(`Failed to send OTP email to ${toEmail}: ${error.message}`);
    return false;
  }
};

module.exports = { createTransporter, sendOtpEmail };
