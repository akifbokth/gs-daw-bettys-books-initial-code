// Import required modules
const express = require("express");
const router = express.Router();

// Route to get all books in machine-readable format (JSON)
router.get('/books', function (req, res, next) {
    // Query database to get all the books
    let sqlquery = "SELECT * FROM books"

    // Execute the SQL query
    db.query(sqlquery, (err, result) => {
        // Return results as a JSON object
        if (err) {
            res.status(500).json({ error: err.message });
            next(err);
        } else {
            res.status(200).json(result);
        }
    });
});

// Export the router object so it can be imported elsewhere
module.exports = router;
