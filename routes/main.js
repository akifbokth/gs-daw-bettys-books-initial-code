// Create a new router
const express = require("express")
const request = require('request')
const router = express.Router()


// Handle our routes
router.get('/',function(req, res, next){
    res.render('index.ejs')
})

router.get('/about',function(req, res, next){
    res.render('about.ejs')
})

// Render the weather form for users to input a city name
router.get('/weather', function(req, res) {
    let formPage = `
        <!doctype html>
        <html>
            <head>
                <link rel="stylesheet" type="text/css" href="/main.css">
                <title>Check Weather</title>
            </head>
            <body>
                <div class="container">
                    <h1 class="weather-header">Check the Weather</h1>
                    <form action="/weather" method="post" class="weather-form">
                        <label for="city" class="form-label">Enter City/Country Name:</label><br>
                        <input type="text" id="city" name="city" class="form-input" required><br><br>
                        <button type="submit" class="form-button">Get Weather</button>
                    </form>
                </div>
            </body>
        </html>
    `;
    res.send(formPage);
});


router.post('/weather', function(req, res, next) {
    let apiKey = 'db8cd38c04b5313b53b0340767a45c95';
    let city = req.body.city; // Get the city from the form input
    let url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;
    
    // Make the request to the weather API
    request(url, function (err, response, body) {
        if (err) {
            next(err);
        } else {
            let weather = JSON.parse(body);
            if (weather.cod === 200) { // Check if the city/ountry was found
                let wmsg = `
                    <!doctype html>
                    <html>
                        <head>
                            <link rel="stylesheet" type="text/css" href="/main.css">
                            <title>Weather in ${weather.name}</title>
                        </head>
                        <body>
                            <div class="container">
                                <h1 class="weather-header">Weather in ${weather.name}</h1>
                                <p class="weather-info">Temperature: <span class="highlight">${weather.main.temp} °C</span></p>
                                <p class="weather-info">Feels Like: <span class="highlight">${weather.main.feels_like} °C</span></p>
                                <p class="weather-info">Weather: <span class="highlight">${weather.weather[0].description}</span></p>
                                <p class="weather-info">Humidity: <span class="highlight">${weather.main.humidity} %</span></p>
                                <p class="weather-info">Wind Speed: <span class="highlight">${weather.wind.speed} m/s</span></p>
                                <p class="weather-info">Wind Direction: <span class="highlight">${weather.wind.deg}°</span></p>
                                <p class="weather-info">Pressure: <span class="highlight">${weather.main.pressure} hPa</span></p>
                                <p class="weather-info">Visibility: <span class="highlight">${weather.visibility} meters</span></p>
                                <a href="/weather" class="weather-link">Check another forecast</a>
                            </div>
                        </body>
                    </html>
                `;
                res.send(wmsg);
            } else {
                res.send(`
                    <!doctype html>
                    <html>
                        <head>
                            <link rel="stylesheet" type="text/css" href="/main.css">
                            <title>Place Not Found</title>
                        </head>
                        <body>
                            <div class="container error">
                                <p>Could not find weather information for the city: <strong>${city}</strong>. Please try again.</p>
                                <a href="/weather">Check another forecast</a>
                            </div>
                        </body>
                    </html>
                `);
            }
        }
    });
});


// Export the router object so index.js can access it
module.exports = router