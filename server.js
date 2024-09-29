require('dotenv').config(); // Load environment variables from .env file
const { checkForNewEpisode } = require("./checkForNewEpisode");
const { getFormattedDateTime, sendEmailNotification } = require("./utils");
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
    // Infinite loop
    while (true) {
        const episodeDetails = await dbGetEpisodeDetails();
        const { episode_id, episode } = episodeDetails;
        const baseUrl = BASE_URL;
        const episodeUrl = `${baseUrl}${episode_id}`;

        const isNewEpisode = await checkForNewEpisode(episodeUrl);

        if (isNewEpisode) {
            console.log("New Episode");
            let currentDateTime = getFormattedDateTime();
            let newEpisodeId = episode_id + 1;
            let newEpisode = episode + 1;

            // Logs the currert information in database
            await dbInsertEpisodeLog(episode_id, episode, currentDateTime);

            // Logs the updtated information in database
            await dbUpdateEpisodeDetails(newEpisodeId, newEpisode, currentDateTime);

            const emailData = {
                title: "Shammi Uncut",
                subject: "New Episode!",
                text: "There is a new episode available!",
                message: `Episode ${episode} is now available at Shammi Uncut`,
                email: RECIVING_EMAIL 
            }
            // Send Email Post request
            await sendEmailNotification(emailData);
        }
        // Time interval runns program every 1 hour
        await new Promise(resovle => setTimeout(resovle, 3600 * 1000));
    }
};
//Runs the main function in an infinite loop.
main()









