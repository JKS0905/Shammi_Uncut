require('dotenv').config();
const { checkForNewEpisode } = require("./checkForNewEpisode");
const { sendEmail } = require('./emailService');

const {
    RECIVING_EMAIL,
} = process.env;

// Run the main function

sendEmail({ recivingEmail: RECIVING_EMAIL, message: "There is a new episode available in shammiUncut!" })

//checkForNewEpisode();