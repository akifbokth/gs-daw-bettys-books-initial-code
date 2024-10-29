const express = require('express');
const router = express.Router();
const request = require('request');

// Display the TV Show search form
router.get('/', function(req, res) {
    res.send(`
        <!doctype html>
        <html>
            <head>
                <link rel="stylesheet" type="text/css" href="/main.css">
                <title>Search TV Shows</title>
            </head>
            <body>
                <div class="container">
                    <h1 class="tv-header">Search for a TV Show</h1>
                    <form action="/tvshows/results" method="post" class="tv-form">
                        <label for="query" class="form-label">Enter TV Show Name:</label><br>
                        <input type="text" id="query" name="query" class="form-input" required><br><br>
                        <button type="submit" class="form-button">Search</button>
                    </form>
                </div>
            </body>
        </html>
    `);
});

// Handle form submission and display TV Show results
router.post('/results', function(req, res) {
    const query = req.body.query;
    const url = `https://api.tvmaze.com/search/shows?q=${encodeURIComponent(query)}`;

    // Make the request to TVMaze API
    request(url, function(err, response, body) {
        if (err) {
            return res.send(`<p>Error: Unable to fetch TV shows. Please try again later.</p>`);
        }

        const shows = JSON.parse(body);

        if (shows.length === 0) {
            return res.send(`
                <!doctype html>
                <html>
                    <head>
                        <link rel="stylesheet" type="text/css" href="/main.css">
                        <title>No Results</title>
                    </head>
                    <body>
                        <div class="container">
                            <h1>No TV Shows Found</h1>
                            <p>Could not find any TV shows for the term: <strong>${query}</strong>.</p>
                            <a href="/tvshows" class="tv-link">Search again</a>
                        </div>
                    </body>
                </html>
            `);
        }

        let resultsPage = `
            <!doctype html>
            <html>
                <head>
                    <link rel="stylesheet" type="text/css" href="/main.css">
                    <title>TV Show Results</title>
                </head>
                <body>
                    <div class="container">
                        <h1 class="tv-header">TV Show Results for "${query}"</h1>
                        <div class="tv-results">
        `;

        shows.forEach(show => {
            if (show.show) {
                resultsPage += `
                    <div class="tv-show">
                        <h2>${show.show.name}</h2>
                        <p><strong>Genre:</strong> ${show.show.genres.join(', ')}</p>
                        <p><strong>Summary:</strong> ${show.show.summary ? show.show.summary.replace(/<[^>]+>/g, '') : 'No summary available.'}</p>
                        ${show.show.image ? `<img src="${show.show.image.medium}" alt="${show.show.name}">` : ''}
                    </div>
                    <hr>
                `;
            }
        });

        resultsPage += `
                        </div>
                        <a href="/tvshows" class="tv-link">Search again</a>
                    </div>
                </body>
            </html>
        `;

        res.send(resultsPage);
    });
});

// Export the router object so index.js can access it
module.exports = router;
