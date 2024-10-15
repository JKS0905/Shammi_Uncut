require('dotenv').config(); // Load environment variables from .env file
const { checkForNewEpisode } = require("./checkForNewEpisode");

const { getFormattedDateTime, 
        sendEmailNotification, 
        delayUntilNextWholeHour, 
        getQuerryValue } = require("./utils");

const { connectToDatabase,
        dbInsertQuerry, 
        dbGetQuery,
        dbUpdateQuerry
} = require("./database");

const {
    RECIVING_EMAIL,
    BASE_URL
} = process.env;

async function main() {
    try {
        // Connects to the Database
        await connectToDatabase();

        // Initial delay until the next whole hour
        await delayUntilNextWholeHour(true);

        console.log("Program is now running");

        // Infinite loop
        while (true) {
            try {
                // Gets the current date and time
                const currentDateTime = getFormattedDateTime();
                
                // Gets data from the configurations data table
                const configurationsData = await dbGetQuery("configurations", ["key", "value"]);

                // Gets specific value from Datbase
                const episode_id = await getQuerryValue(configurationsData, "episode_id", true);
                const episode_number = await getQuerryValue(configurationsData, "episode_number", true);

                const baseUrl = BASE_URL;
                const episodeUrl = `${baseUrl}${episode_id}`;

                // Checks to see if there is a new episode
                const isNewEpisode = await checkForNewEpisode(episodeUrl);

                if (isNewEpisode) {
                    let newEpisodeId = episode_id + 1;
                    let newEpisode_number = episode_number + 1;
                    console.log(`Episode ${episode_number} is now available at Shammi Uncut - ${currentDateTime}`);

                    // Logs the currert information in database asynchronously
                    await dbInsertQuerry("episodes", ["episode_id", "episode", "date"], [episode_id, episode_number, currentDateTime]);

                    // Updates the configurations table in the database asynchronously
                    await dbUpdateQuerry("configurations", "episode_id", newEpisodeId);
                    await dbUpdateQuerry("configurations", "episode_number", newEpisode_number);

                    const emailData = {
                        title: "Shammi Uncut",
                        subject: "New Episode!",
                        message: `Episode ${episode_number} is now available at Shammi Uncut`,
                        email: RECIVING_EMAIL
                    };

                    const maxAttempts = await getQuerryValue(configurationsData, "email_max_attempts", true);
                    const retryDelay = await getQuerryValue(configurationsData, "email_retry_delay", true);

                    // Send Email Post request
                    await sendEmailNotification(emailData, maxAttempts, retryDelay);
                
                } else {
                    console.log(`No new episode - ${currentDateTime}`)
                }
                
                // Time interval runns program every 1 hour
                await delayUntilNextWholeHour();

            } catch (error) {
                console.error(`Error mainWile: ${error.message}`);
            }
        }
    } catch (error) {
        console.error(`Error main: ${error.message}`);
    }
};

//Runs the main function in an infinite loop.
main();