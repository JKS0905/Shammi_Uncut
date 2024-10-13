require('dotenv').config(); // Load environment variables from .env file
const axios = require("axios")
const sgMail = require('@sendgrid/mail');

//const axios = require('axios');
const { SEND_EMAIL_NOTIFICATION_URL, API_KEY, SG_API_KEY, SENDER_EMAIL } = process.env;


async function sendEmailNotification(emailData) {
    try {
        const response = await axios.post(SEND_EMAIL_NOTIFICATION_URL, emailData, {
            headers: {"Authorization": API_KEY}
        });

        if (response.status === 200) {
            return true;
        } else {
            console.error(`Failed to send email: ${response.status}`);
            return false;
        }

    } catch (error) {
        console.error(`Error sending email: ${error.message} - ${error.response ? error.response.data : null}`);
        return false;
    }
};

async function sendEmailNotificationBackup(emailData) {
    try {
        sgMail.setApiKey(SG_API_KEY);

        // Deconstruct emailData
        const { title, subject, message, email } = emailData;

        const emailMessage = {
        to: email,
        from: {
            name: title,
            email: SENDER_EMAIL
        },
        subject: `${subject} - Backup`,
        text: message
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

// Validate Querry value
async function getQuerryValue(querryResult, querryKey, returnNumber) {

    // Find the entry with the key you're interested in
    const entry = querryResult.find(entry => entry.key === querryKey);

    // Check if the entry exists and return the value
    if (entry) {
        if (returnNumber === true) {
            // return Number instead of string.
            return Number(entry.value)
        }
        else {
            return entry.value
        }
    }
    else {
        console.log('Episode number not found.');
    }
};

module.exports = { getFormattedDateTime, sendEmailNotification, sendEmailNotificationBackup, getQuerryValue };