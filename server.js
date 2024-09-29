require('dotenv').config();
const { checkForNewEpisode } = require("./checkForNewEpisode");
const { sendEmail } = require("./emailService");
const { connectToDatabase,
        dbinsertEpisodeLog, 
        dbUpdateEpisode, 
        dbDeleteEpisode,
        dbFetchAllEpisodes,
        dbDeleteColumn,
        dbGetEpisodeDetails,
        dbUpdateEpisodeDetails
} = require("./database")

const {
    RECIVING_EMAIL,
    BASE_URL
} = process.env;

function getFormattedDateTime() {
    const now = new Date();

    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0'); // getMonth() is 0-based, so add 1
    const year = now.getFullYear();

    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');

    return `${day}/${month}/${year} - ${hours}:${minutes}`;
};

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
        console.log("SERVER", isNewEpisode);

        if (isNewEpisode) {
            console.log("New Episode");
            let currentDateTime = getFormattedDateTime();
            let newEpisodeId = episode_id + 1;
            let newEpisode = episode + 1;

            // Logs the currert information in database
            await dbinsertEpisodeLog(episode_id, episode, currentDateTime);

            // Logs the updtated information in database
            await dbUpdateEpisodeDetails(newEpisodeId, newEpisode, currentDateTime);
            



        } else {
            console.log("NO New Episode");
        }
        await new Promise(resovle => setTimeout(resovle, 60 * 1000));
    }
}

//Runs the main function in an infinite loop.
main()

//sendEmail({ recivingEmail: RECIVING_EMAIL, message: "There is a new episode available in shammiUncut!" })

//async function testing() {
//    await connectToDatabase();
//    const episodeDetails = await dbGetEpisodeDetails();
//    const { episode_id, episode, date } = episodeDetails;
//    console.log(currentDateTime);
//}
//
//testing();


//insertEpisodeLog(1176, 202, "29/09/2024 - 01:42")






