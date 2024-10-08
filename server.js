require('dotenv').config(); // Load environment variables from .env file
const { checkForNewEpisode } = require("./checkForNewEpisode");
const { getFormattedDateTime, sendEmailNotification, sendEmailNotificationBackup } = require("./utils");
const { connectToDatabase,
        dbInsertEpisodeLog, 
        dbGetEpisodeDetails,
        dbUpdateEpisodeDetails
} = require("./database")

const {
    RECIVING_EMAIL,
    BASE_URL
} = process.env;

async function main() {
    // Connects to the Database
    await connectToDatabase();

    // Calculate delay until the next whole hour
    const now = new Date();

    const minuteUntilNextHour = now.getMinutes() === 0 ? 0 : 60 - now.getMinutes();  // Handles edge case at the top of the hour
    const secondsUntilNextHour = now.getSeconds() === 0 ? 0 : 60 - now.getSeconds();  // Handles edge case at 00 seconds
    const delayUntilNextHour = (minuteUntilNextHour * 60 + secondsUntilNextHour) * 1000;

    console.log(`The program will start in ${minuteUntilNextHour} minutes and ${secondsUntilNextHour} secounds`);
    console.log(`Calculated delay: ${delayUntilNextHour} milliseconds`);

    await new Promise(resolve => setTimeout(resolve, delayUntilNextHour));

    console.log("Program is now running");

    // Infinite loop
    while (true) {
        const episodeDetails = await dbGetEpisodeDetails();
        const { episode_id, episode } = episodeDetails;
        const baseUrl = BASE_URL;
        const episodeUrl = `${baseUrl}${episode_id}`;

        const isNewEpisode = await checkForNewEpisode(episodeUrl);

        if (isNewEpisode) {
            let currentDateTime = getFormattedDateTime();
            let newEpisodeId = episode_id + 1;
            let newEpisode = episode + 1;
            console.log(`Episode ${episode} is now available at Shammi Uncut - ${currentDateTime}`);

            // Logs the currert information in database
            await dbInsertEpisodeLog(episode_id, episode, currentDateTime);

            // Logs the updtated information in database
            await dbUpdateEpisodeDetails(newEpisodeId, newEpisode, currentDateTime);

            const emailData = {
                title: "Shammi Uncut",
                subject: "New Episode!",
                message: `Episode ${episode} is now available at Shammi Uncut`,
                email: RECIVING_EMAIL
            }

            // Send Email Post request
            const emailSuccess = await sendEmailNotification(emailData);

            if (!emailSuccess) {
                // External API service
                await sendEmailNotificationBackup(emailData);
            }
        }
        // Time interval runns program every 1 hour
        await new Promise(resovle => setTimeout(resovle, 3600 * 1000));
    }
};

//Runs the main function in an infinite loop.
main();
