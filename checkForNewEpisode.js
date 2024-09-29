require('dotenv').config(); // Load environment variables from .env file
const axios = require('axios');
const cheerio = require('cheerio');
const { CookieJar } = require('tough-cookie');
const { wrapper } = require('axios-cookiejar-support');
const { LOGIN_URL, EMAIL, PASSWORD } = process.env;

async function checkNewEpisodeUrl(url, axiosInstance) {
    try {
        // Make a GET request to the URL
        const response = await axiosInstance.get(url)

        if (response.status === 200) {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        // No new episode found, dont log error for 404 but everything else
        if (error.response.status === 404) {
            return false;
        } else {
            console.error(`Error checking New Episode URL ${url}:`, error.message);
            return false;
        }
    }
};

async function checkForNewEpisode(episodeUrl) {
    // Create a new cookie jar to store cookies
    const cookieJar = new CookieJar();
    const axiosInstance = wrapper(axios.create({ jar: cookieJar })); // Use wrapper
    try {
        // Fetch the login page to get the CSRF token
        const response = await axiosInstance.get(LOGIN_URL, {
            jar: cookieJar,
            withCredentials: true
        });

        // Parse the response data to extract CSRF token
        const $ = cheerio.load(response.data);
        const csrfToken = $('meta[name="csrf-token"]').attr('content') || $('input[name="_token"]').val();

        if (!csrfToken) {
            throw new Error("CSRF token not found!");
        }

        // Perform login with CSRF token
        const loginResponse = await axiosInstance.post(LOGIN_URL, new URLSearchParams({
            _token: csrfToken,
            email: EMAIL,
            password: PASSWORD
        }).toString(), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Referer': LOGIN_URL,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
                'X-CSRF-Token': csrfToken
            },
            jar: cookieJar,
            withCredentials: true
        });

        if (loginResponse.status === 200) {
            const isNewEpisode = await checkNewEpisodeUrl(episodeUrl, axiosInstance);
            if (isNewEpisode) { 
                return true; 
            } 
            else { 
                return false; 
            }
        } else {
            throw new Error("Error during login")
        }
    } catch (error) {
        console.error("Error during login:", error.response ? error.response.data : error.message);
    }
};

module.exports = { checkForNewEpisode };