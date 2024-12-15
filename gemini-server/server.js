const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = 5000;

// Enable CORS
app.use(cors());

// Middleware to parse JSON
app.use(bodyParser.json());

// In-memory storage for demonstration purposes
let responsesStorage = [];

// Function to get location using IP
async function getLocation() {
  try {
    const response = await axios.get('http://ip-api.com/json/');
    const { city, country, lat, lon } = response.data;
    return { city, country, lat, lon };
  } catch (error) {
    console.error('Error fetching location:', error.message);
    return null;
  }
}

// Function to get weather details
async function getWeather(lat, lon) {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

  try {
    const response = await axios.get(weatherUrl);
    const { main, weather, name } = response.data;
    return {
      condition: weather[0].description,
      temperature: main.temp,
      location: name,
    };
  } catch (error) {
    console.error('Error fetching weather:', error.message);
    return null;
  }
}

// API endpoint to fetch location and weather
app.get('/api/weather', async (req, res) => {
  const location = await getLocation();
  if (!location) {
    return res.status(500).json({ error: 'Failed to fetch location.' });
  }

  const weather = await getWeather(location.lat, location.lon);
  if (!weather) {
    return res.status(500).json({ error: 'Failed to fetch weather details.' });
  }

  res.json({
    location: `${location.city}, ${location.country}`,
    condition: weather.condition,
    temperature: `${weather.temperature}°C`,
  });
});

// POST API to handle user responses
app.post("/api/save-responses", (req, res) => {
  const { responses } = req.body;

  if (!responses || !Array.isArray(responses)) {
    return res.status(400).json({ error: "Invalid request body. Expecting 'responses' array." });
  }

  // Save responses to storage (or database in production)
  responsesStorage.push(...responses);

  console.log("User responses received:", responses);
  
  // Send success response
  res.status(200).json({ message: "Responses saved successfully!" });
});

// GET API to retrieve saved responses (optional)
app.get("/api/responses", (req, res) => {
  res.status(200).json({ data: responsesStorage });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
