const nodemailer = require('nodemailer')
const asyncHandler = require('../utils/asyncHandler')
const { sendSuccess, sendError } = require('../utils/apiResponse')
const logger = require('../utils/logger')

const CONTACT_RECIPIENT = process.env.CONTACT_RECIPIENT_EMAIL || 'support.janseva@gmail.com'
const PLACEHOLDER_SMTP_PASS = 'your_gmail_app_password'

const createTransporter = () => {
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS

  if (!user || !pass || pass === PLACEHOLDER_SMTP_PASS) {
    return null
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user,
      pass,
    },
  })
}

const escapeHtml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

const buildHtmlMessage = ({ firstName, lastName, email, phone, subject, message }) => `
  <div style="font-family: Arial, sans-serif; color: #1b4332; line-height: 1.6;">
    <h2 style="margin-bottom: 16px; color: #2d6a4f;">New JanSeva Contact Message</h2>
    <table style="border-collapse: collapse; width: 100%; max-width: 640px;">
      <tbody>
        <tr>
          <td style="padding: 10px 12px; border: 1px solid #d8f3dc; background: #f6fcf7; font-weight: 700;">Name</td>
          <td style="padding: 10px 12px; border: 1px solid #d8f3dc;">${escapeHtml(firstName)} ${escapeHtml(lastName)}</td>
        </tr>
        <tr>
          <td style="padding: 10px 12px; border: 1px solid #d8f3dc; background: #f6fcf7; font-weight: 700;">Email</td>
          <td style="padding: 10px 12px; border: 1px solid #d8f3dc;">${escapeHtml(email)}</td>
        </tr>
        <tr>
          <td style="padding: 10px 12px; border: 1px solid #d8f3dc; background: #f6fcf7; font-weight: 700;">Phone</td>
          <td style="padding: 10px 12px; border: 1px solid #d8f3dc;">${escapeHtml(phone || 'Not provided')}</td>
        </tr>
        <tr>
          <td style="padding: 10px 12px; border: 1px solid #d8f3dc; background: #f6fcf7; font-weight: 700;">Subject</td>
          <td style="padding: 10px 12px; border: 1px solid #d8f3dc;">${escapeHtml(subject)}</td>
        </tr>
        <tr>
          <td style="padding: 10px 12px; border: 1px solid #d8f3dc; background: #f6fcf7; font-weight: 700; vertical-align: top;">Message</td>
          <td style="padding: 10px 12px; border: 1px solid #d8f3dc; white-space: pre-wrap;">${escapeHtml(message)}</td>
        </tr>
      </tbody>
    </table>
  </div>
`

const buildTextMessage = ({ firstName, lastName, email, phone, subject, message }) => `
New JanSeva Contact Message

Name: ${firstName} ${lastName}
Email: ${email}
Phone: ${phone || 'Not provided'}
Subject: ${subject}

Message:
${message}
`.trim()

const sendContactMessage = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, phone, subject, message } = req.body
  const transporter = createTransporter()

  if (!transporter) {
    return sendError(
      res,
      500,
      'Contact email is not configured yet. Please add SMTP_USER and SMTP_PASS in Backend/.env to enable sending.'
    )
  }

  try {
    await transporter.sendMail({
      from: `"JanSeva Contact Form" <${process.env.SMTP_USER}>`,
      to: CONTACT_RECIPIENT,
      replyTo: email,
      subject: `[JanSeva Contact] ${subject}`,
      text: buildTextMessage({ firstName, lastName, email, phone, subject, message }),
      html: buildHtmlMessage({ firstName, lastName, email, phone, subject, message }),
    })

    logger.info(`Contact message sent from ${email} to ${CONTACT_RECIPIENT}`)
    return sendSuccess(res, 200, 'Message sent successfully')
  } catch (error) {
    logger.error(`Failed to send contact message: ${error.message}`)
    return sendError(res, 500, 'Unable to send message right now. Please try again later.')
  }
})

module.exports = {
  sendContactMessage,
}
