require('dotenv').config(); // Load environment variables from .env file
const { checkForNewEpisode } = require("./checkForNewEpisode");
const { getFormattedDateTime, sendEmailNotification, sendEmailNotificationBackup, getQuerryValue } = require("./utils");
const { connectToDatabase,
        dbInsertQuerry, 
        dbGetQuery,
        dbUpdateQuerry
} = require("./database")

const {
    RECIVING_EMAIL,
    BASE_URL
} = process.env;

async function main() {
    try {
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
            try {
                // Gets data from the configurations data table
                const configurationsData = await dbGetQuery("configurations", ["key", "value"]);

                // Gets specific values from Datbase
                const episode_id = await getQuerryValue(configurationsData, "episode_id", true);
                const episode_number = await getQuerryValue(configurationsData, "episode_number", true)

                const baseUrl = BASE_URL;
                const episodeUrl = `${baseUrl}${episode_id}`;

                // Checks to see if there is a new episode
                const isNewEpisode = await checkForNewEpisode(episodeUrl);

                if (isNewEpisode) {
                    let currentDateTime = getFormattedDateTime();
                    let newEpisodeId = episode_id + 1;
                    let newEpisode_number = episode_number + 1;
                    console.log(`Episode ${episode_number} is now available at Shammi Uncut - ${currentDateTime}`);

                    const emailData = {
                        title: "Shammi Uncut",
                        subject: "New Episode!",
                        message: `Episode ${episode_number} is now available at Shammi Uncut`,
                        email: RECIVING_EMAIL
                    }

                    // Logs the data and updates configurations in the database
                    dbInsertQuerry("episodes", ["episode_id", "episode", "date"], [episode_id, episode_number, currentDateTime])
                        .then(() => dbUpdateQuerry("configurations", "episode_id", newEpisodeId))           
                        .then(() => dbUpdateQuerry("configurations", "episode_number", newEpisode_number))
                        .then(() => sendEmailNotification(emailData)) // Send Email Post request
                        .then(emailSuccess => {
                            if (!emailSuccess) {
                                return new Promise((resolve) => {
                                    setTimeout(resolve, 5 * 60 * 1000);
                                }).then(() => sendEmailNotification(emailData))
                            }
                        })
                        .then(emailSuccess => {
                            if (!emailSuccess) {
                                return sendEmailNotificationBackup(emailData); // External API service
                            }
                        })
                        .catch(error => {
                            console.error("Error processing new episode:", error);
                        });
                }
                // Time interval runns program every 1 hour
                await new Promise(resovle => setTimeout(resovle, 3600 * 1000));

            } catch (error) {
                console.error(`Error main program: ${error.message}`);
            }
        }
    } catch (error) {
        console.error(`Error main function: ${error.message}`);
    }
};

//Runs the main function in an infinite loop.
main();