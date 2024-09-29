require('dotenv').config(); // Load environment variables from .env file
const axios = require('axios');
const { SEND_EMAIL_NOTIFICATION_URL } = process.env;

async function sendEmailNotification(emailData) {
    try {
        const response = await axios.post(SEND_EMAIL_NOTIFICATION_URL, emailData);

        if (response.status === 200) {
            console.log('Email sent successfully');
        } else {
            console.error(`Failed to send email: ${response.status}`);
        }

    } catch (error) {
        console.error(`Error sending email: ${error.message}`);
    }
}

function getFormattedDateTime() {
    const now = new Date();

    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0'); // getMonth() is 0-based, so add 1
    const year = now.getFullYear();

    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');

    return `${day}/${month}/${year} - ${hours}:${minutes}`;
};

module.exports = { getFormattedDateTime, sendEmailNotification };