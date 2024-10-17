require('dotenv').config(); // Load environment variables from .env file
const { Client } = require('pg');

const client = new Client({
    connectionString: process.env.DATABASE_URL,  // Use the connection URL here
    ssl: { rejectUnauthorized: false }  // Enable SSL if required sdw
});

async function connectToDatabase() {
    try {
        await client.connect();
        console.log('Connected to Database');
        return true;
    } catch (error) {
        console.error('Database Connection error:', error.stack);
        return false;
    }
};

async function dbInsertQuerry(table, keys, values) {
    try {
        // Ensure keys and values arrays have the same length
        if (keys.length !== values.length) {
            throw new Error("Keys and values must have the same length");
        }

        const placeholders = keys.map((_, index) => `$${index + 1}`).join(', '); // Create $1, $2, $3... for parameters

        // SQL query to insert a new row in the table with all the fields
        const insertQuery = `
        INSERT INTO ${table} (${keys.join(', ')}) 
        VALUES (${placeholders});
        `;

        // Run the query with all values in a single execution
        await client.query(insertQuery, values);
    
    } catch (error) {
        console.error('Error inserting episode log:', error.stack);
    }
};

async function dbGetQuery(table, keys) {
    try {
        // Join keys array into a comma-separated string
        const selectedKeys = Array.isArray(keys) ? keys.join(', ') : keys;

        const getQuery = `
            SELECT ${selectedKeys}
            FROM ${table}
        `;
        
        const res = await client.query(getQuery);
        
        if (res.rows.length > 0) {
            // Return all rows retrieved from the query
            return res.rows; // This will return an array of objects
        } else {
            throw new Error(`No rows found in Table: ${table}`);
        }
        
    } catch (error) {
        console.error('Error retrieving episode details:', error.stack);
    } 
};

async function dbUpdateQuerry(table, key, value) {
    try {
        const updateQuery = `
            UPDATE ${table}
            SET value = $2
            WHERE key = $1
        `;
        
        // Pass parameters: key and value
        const res = await client.query(updateQuery, [key, value]);
        
        if (res.rowCount === 0) { 
            console.log('No rows updated. The row might not exist.'); 
        }

    } catch (error) {
        console.error('Error updating configuration:', error.stack);
    }
};

module.exports = { connectToDatabase,
                   dbInsertQuerry, 
                   dbGetQuery,
                   dbUpdateQuerry
                };