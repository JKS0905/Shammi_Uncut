require('dotenv').config();
const axios = require('axios');
const cheerio = require('cheerio');
const { CookieJar } = require('tough-cookie');
const { wrapper } = require('axios-cookiejar-support');

const {
    LOGIN_URL,
    EMAIL,
    PASSWORD
} = process.env;

// Create a new cookie jar to store cookies
const cookieJar = new CookieJar();
const axiosInstance = wrapper(axios.create({ jar: cookieJar })); // Use wrapper

async function checkNewEpisodeUrl(url) {
    try {
        // Make a GET request to the URL
        const response = await axiosInstance.get(url, {
            jar: cookieJar, // Use the same cookie jar to maintain authentication
            withCredentials: true
        });

        if (response.status === 200) {
            console.log(`URL ${url} returned status 200`);
            return true;
        } else {
            console.log(`URL ${url} returned status ${response.status}`);
            return false;
        }
    } catch (error) {
        if (error.response) {
            console.error(`Error checking New Episode URL ${url}: Status ${error.response.status} -`, error.response.data);
            return false;
        } else {
            console.error(`Error checking New Episode URL ${url}:`, error.message);
            return false;
        }
    }
};

async function checkForNewEpisode() {
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
            console.log("Login successful!");

            const isNewEpisode = await checkNewEpisodeUrl("https://shammiuncut.com/watch/movieNew/1196");
            console.log(isNewEpisode);

        } else {
            console.log("Login failed!");
        }

    } catch (error) {
        console.error("Error during login:", error.response ? error.response.data : error.message);
    }
};

module.exports = { checkForNewEpisode };
