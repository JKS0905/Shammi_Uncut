require('dotenv').config(); // Load environment variables from .env file
const sgMail = require('@sendgrid/mail');

//const axios = require('axios');
const { SEND_EMAIL_NOTIFICATION_URL, SG_API_KEY, SENDER_EMAIL } = process.env;

async function sendEmailNotification(emailData) {
    try {
        sgMail.setApiKey(SG_API_KEY);

        // Deconstruct emailData
        const { title, subject, text, message, email } = emailData;

        const emailMessage = {
        to: email,
        from: {
            name: title,
            email: SENDER_EMAIL
        },
        subject: subject,
        text: text,
        html: `<span>${message}</span>`,
        }
        sgMail
        .send(emailMessage)
        .catch((error) => {
            console.error(error);
        })
    } catch (error) {
        console.error(`Error sending email: ${error.message}`);
    }
};

function getFormattedDateTime() {
    const now = new Date();

    // Add 2 hours to account for the timezone difference
    now.setHours(now.getHours() + 2);

    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0'); // getMonth() is 0-based, so add 1
    const year = now.getFullYear();

    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');

    return `${day}/${month}/${year} - ${hours}:${minutes}`;
};

module.exports = { getFormattedDateTime, sendEmailNotification };