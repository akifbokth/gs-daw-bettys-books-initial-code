const express = require("express");
const router = express.Router();

// Middleware to check if the user is logged in
const redirectLogin = (req, res, next) => {
    if (!req.session.userId) {
        res.redirect('../users/login'); // Redirect to the absolute path of the login page
    } else {
        next(); // Move to the next middleware function
    }
};

router.get('/search', function(req, res, next) {
    res.render("search.ejs");
});

router.get('/search_result', function(req, res, next) {
    // Search the database
    let sqlquery = "SELECT * FROM books WHERE name LIKE '%" + req.query.search_text + "%'"; // Query database to get all the books
    // Execute SQL query
    db.query(sqlquery, (err, result) => {
        if (err) {
            next(err);
        }
        res.render("list.ejs", { availableBooks: result });
    });
});

router.get('/list', function(req, res, next) {
    let sqlquery = "SELECT * FROM books"; // Query database to get all the books
    // Execute SQL query
    db.query(sqlquery, (err, result) => {
        if (err) {
            next(err);
        }
        res.render("list.ejs", { availableBooks: result });
    });
});

// Apply the redirectLogin middleware here
router.get('/addbook', redirectLogin, function(req, res, next) {
    res.render('addbook.ejs');
});

router.post('/bookadded', function(req, res, next) {
    // Saving data in the database
    let sqlquery = "INSERT INTO books (name, price) VALUES (?, ?)";
    // Execute SQL query
    let newrecord = [req.body.name, req.body.price];
    db.query(sqlquery, newrecord, (err, result) => {
        if (err) {
            next(err);
        } else {
            res.send('This book has been added to the database, name: ' + req.body.name + ' price ' + req.body.price);
        }
    });
});

router.get('/bargainbooks', function(req, res, next) {
    let sqlquery = "SELECT * FROM books WHERE price < 20";
    db.query(sqlquery, (err, result) => {
        if (err) {
            next(err);
        }
        res.render("bargains.ejs", { availableBooks: result });
    });
});

// Export the router object so index.js can access it
module.exports = router;
