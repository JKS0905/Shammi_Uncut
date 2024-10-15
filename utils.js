require('dotenv').config(); // Load environment variables from .env file
const axios = require("axios")
const sgMail = require('@sendgrid/mail');

//const axios = require('axios');
const { SEND_EMAIL_NOTIFICATION_URL, API_KEY, SG_API_KEY, SENDER_EMAIL } = process.env;


async function sendEmailNotification(emailData, maxAttempts, retryDelay) { 
    // For loop to retry sending email if it fails
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            const response = await axios.post(SEND_EMAIL_NOTIFICATION_URL, emailData, {
                headers: {"Authorization": API_KEY}
            });

            if (response.status === 200) {
                return true;
            } else {
                console.error(`Attempt ${attempt} failed: ${response.status}`);
            }

        } catch (error) {
            console.error(`Attempt ${attempt} failed: ${error.message} - ${error.response ? error.response.data : null}`);
        }

        if (attempt < maxAttempts) {
            console.log(`Retrying in ${retryDelay} seconds...`);
            await new Promise(resolve => setTimeout(resolve, retryDelay * 1000))
        } else {
            await sendEmailNotificationBackup(emailData); // Call backup email service, External API service
            return false;
        }
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
        text: `${message} - Sendt from Backup Service`
        }
        sgMail
        .send(emailMessage)
        .then(() => { 
            console.log("Successfully sendt Backup Email"); 
        })
        .catch((error) => {
            console.error(error); 
        });
    } catch (error) {
        console.error(`Error sending email: ${error.message}`);
    }
};

async function delayUntilNextWholeHour(log) {
    const now = new Date();
    const minuteUntilNextHour = now.getMinutes() === 0 ? 0 : 60 - now.getMinutes();  // Handles edge case at the top of the hour
    const secondsUntilNextHour = now.getSeconds() === 0 ? 0 : 60 - now.getSeconds();  // Handles edge case at 00 seconds
    const delay = (minuteUntilNextHour * 60 + secondsUntilNextHour) * 1000;
    
    if (log) {
        console.log(`Delaying program for ${minuteUntilNextHour} minutes and ${secondsUntilNextHour} seconds`);
    }
    await new Promise(resolve => setTimeout(resolve, delay));
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
    const secounds = String(now.getSeconds()).padStart(2, '0');

    return `${day}/${month}/${year} - ${hours}:${minutes}:${secounds}`;
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

module.exports = { getFormattedDateTime, 
                   sendEmailNotification, 
                   delayUntilNextWholeHour, 
                   getQuerryValue, };