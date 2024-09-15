const nodeMailer = require("nodemailer");
const path = require('path');

// Load environment variables
const {
  TRANSPORTER_PORT,
  TRANSPORTER_HOST,
  TRANSPORTER_USER,
  TRANSPORTER_PASSWORD,
  SENDER_EMAIL
} = process.env;

// Sends the email
async function sendEmail({recivingEmail, message }) {
  try {
    console.log(`Sending email to: ${recivingEmail}`);
    // SMTP credentials
    let transporter = nodeMailer.createTransport({
      host: TRANSPORTER_HOST,
      port: TRANSPORTER_PORT,
      secure: false,
      auth: {
        user: TRANSPORTER_USER,
        pass: TRANSPORTER_PASSWORD
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    // Sender and Receiver information
    let mailOptions = {
      from: `Node Alert <${SENDER_EMAIL}>`,
      to: recivingEmail,
      subject: `ShammiUncut New Episode!`,
      text: message
    };

    // Send the email
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error(`Error sending email: ${error}`);
    return { success: false, error: error.message };
  }
}

module.exports = { sendEmail };
