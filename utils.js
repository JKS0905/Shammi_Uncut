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

const testMode = true;

async function delayUntilNextWholeHour(log) {
    let now = new Date();

    // If already at 00:00, skip delay
    if (now.getMinutes() === 0 && now.getSeconds() === 0) {
        console.log("Timer already on TOP of the hour");
        return;
    }

    const minuteUntilNextHour  = 60 - now.getMinutes();  
    const secondsUntilNextHour = 60 - now.getSeconds(); 
    
    const delay = (minuteUntilNextHour * 59 + secondsUntilNextHour) * 1000;
    
    if (log) {
        console.log(`Delaying program for ${minuteUntilNextHour} minutes and ${secondsUntilNextHour} seconds`);
    }

    await new Promise(resolve => setTimeout(resolve, delay));

    if (!testMode) {
        return;
    }

    //now = new Date();
    //
    //if (now.getMinutes() === 0 && now.getSeconds() <= 59) {
    //    console.log("Timer retuned on TOP of hour");
    //    return;
    //}
    //else {
    //    const min = String(now.getMinutes()).padStart(2, "0");
    //    const sec = String(now.getSeconds()).padStart(2, "0");
    //    console.log(`Wating one more hour to try again to hit 00:00, current time: ${min}:${sec}`);
    //    await delayUntilNextWholeHour();
    //}
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

module.exports = { getFormattedDateTime, 
                   sendEmailNotification, 
                   delayUntilNextWholeHour, 
                   getQuerryValue, };
