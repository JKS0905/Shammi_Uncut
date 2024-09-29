require('dotenv').config(); // Load environment variables from .env file
const { Client } = require('pg');

const client = new Client({
    connectionString: process.env.DATABASE_URL, // Use the connection URL here
    ssl: { rejectUnauthorized: false }  // Enable SSL if required
});

async function connectToDatabase() {
    try {
        await client.connect();
        console.log('Connected to Database');
    } catch (error) {
        console.error('Database Connection error:', error.stack);
    }
};

async function dbinsertEpisodeLog(episodeId, episodeNumber, dateTime) {
    try {
        // SQL query to insert a new row in the table with all the fields
        const insertQuery = `
            INSERT INTO shammi_uncut_episodes (episode_id, episode, date) 
            VALUES ($1, $2, $3);
        `;
        
        // Run the query with all values in a single execution
        await client.query(insertQuery, [episodeId, episodeNumber, dateTime]);
        console.log(`Log for Episode ID ${episodeId}, Episode Number ${episodeNumber}, and Date ${dateTime} added successfully`);
        
    } catch (err) {
        console.error('Error inserting episode log:', err.stack);
    }
};

async function dbGetEpisodeDetails() {
    try {
        const getEpisodeQuery = `
            SELECT episode_id, episode, date
            FROM shammi_uncut_logic
            ORDER BY episode_id
            LIMIT 1 OFFSET 0; -- Adjust OFFSET for other rows
        `;
        
        const res = await client.query(getEpisodeQuery);
        
        if (res.rows.length > 0) {
            // Return the entire row with all selected columns
            return res.rows[0]; // This will return an object with { episode_id, episode, date }
        } else {
            throw new Error("No rows found in Table: shammi_uncut_logic ");
        }
        
    } catch (error) {
        console.error('Error retrieving episode details:', error.stack);
    } 
};

async function dbUpdateEpisodeDetails(newEpisodeId, newEpisodeNumber, dateTime) {
    try {
        const updateQuery = `
            UPDATE shammi_uncut_logic
            SET episode_id = $1, episode = $2, date = $3
            WHERE episode_id = (SELECT episode_id FROM shammi_uncut_logic ORDER BY episode_id LIMIT 1 OFFSET 0); -- Adjust OFFSET for other rows
        `;
        
        // Pass all parameters: newEpisodeId, newEpisodeNumber, and dateTime
        const res = await client.query(updateQuery, [newEpisodeId, newEpisodeNumber, dateTime]);
        
        if (res.rowCount > 0) {
            console.log(`Successfully updated episode ID to ${newEpisodeId}, episode number to ${newEpisodeNumber}, and date to ${dateTime}.`);
        } else {
            console.log('No rows updated. The row might not exist.');
        }
    } catch (error) {
        console.error('Error updating episode:', error.stack);
    }
};

module.exports = { connectToDatabase,
                   dbinsertEpisodeLog, 
                   dbGetEpisodeDetails,
                   dbUpdateEpisodeDetails
                };