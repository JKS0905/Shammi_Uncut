require('dotenv').config();
const { Client } = require('pg');
const { checkForNewEpisode } = require("./checkForNewEpisode");
const { sendEmail } = require('./emailService');

const {
    RECIVING_EMAIL,
} = process.env;

// Run the main function

//sendEmail({ recivingEmail: RECIVING_EMAIL, message: "There is a new episode available in shammiUncut!" })

//checkForNewEpisode();

const client = new Client({
    host: process.env.PG_HOST,
    port: process.env.PG_PORT,
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    database: process.env.PG_DATABASE,
    ssl: { rejectUnauthorized: false } // Enable SSL if required
});

async function setupDatabase() {
    try {
        await client.connect();
        console.log('Connected to PostgreSQL');
        // Your database setup code here
    } catch (err) {
        console.error('Database connection error:', err.stack);
    } finally {
        await client.end();
    }
}

setupDatabase();