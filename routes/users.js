// Login for Akif - akifb45 - starboy

// Create a new router
const express = require("express");
const router = express.Router();
const bcrypt = require('bcrypt');
const saltRounds = 10;
const { check, validationResult } = require('express-validator');

// Middleware to check if the user is logged in
const redirectLogin = (req, res, next) => {
    if (!req.session.userId) {
        res.redirect('./login'); // Redirect to the absolute path of the login page
    } else {
        next(); // Move to the next middleware function
    }
};

router.get('/login', function (req, res, next) {
    res.render('login.ejs');
});

router.post('/loggedin', function (req, res, next) {
    const plainPassword = req.body.password;

    // Use a parameterized query to prevent SQL injection
    let sqlquery = "SELECT hashedPassword FROM users WHERE username = ?";

    // Assuming you have a database connection object called 'db'
    db.query(sqlquery, [req.body.username], function (error, results) {
        if (error) {
            return next(error); // Handle database error
        }

        if (results.length === 0) {
            // User not found; send response immediately and stop further execution
            return res.send('User not found!');
        }

        const hashedPassword = results[0].hashedPassword;

        // Compare the password supplied with the hashed password from the database
        bcrypt.compare(plainPassword, hashedPassword, function (err, result) {
            if (err) {
                return next(err); // Handle bcrypt error
            }
            
            if (result === true) {
                // Save user session here, when login is successful
                req.session.userId = req.body.username;
                // Redirect to the main menu screen (index.ejs) after successful login
                return res.redirect('/'); // Return to ensure no further code executes
            } else {
                // Incorrect password; send response and stop further execution
                return res.send('Incorrect password!');
            }
        });
    });
});

router.get('/register', function (req, res, next) {
    res.render('register.ejs');
});

router.post('/registered', 
    [check('email').isEmail()], 
    [check('password').notEmpty().isLength({ min: 8 })], 
    [check('firstname').isLength({ max: 14 })],
    [check('lastname').isLength({ max: 14 })],
    function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.redirect('./register'); }
    else { 
        const plainPassword = req.body.password;
        
        // Hashing the password
        bcrypt.hash(plainPassword, saltRounds, function (err, hashedPassword) {
            if (err) {
                return next(err); // handle error properly
            }

            // Now that we have the hashed password, we can save the data in the database
            let sqlquery = "INSERT INTO users (username, firstname, lastname, email, hashedPassword) VALUES (?, ?, ?, ?, ?)";
            let newRecord = [req.body.username, req.body.first, req.body.last, req.body.email, hashedPassword];

            db.query(sqlquery, newRecord, function (error, results, fields) {
                if (error) {
                    return next(error); // handle database error
                }

                let result = 'Hello ' + req.sanitize(req.body.first) + ' ' + req.sanitize(req.body.last) + ', you are now registered! We will send an email to you at ' + req.body.email;
                // result += '. Your password is: ' + req.body.password + ' and your hashed password is: ' + hashedPassword;
                res.send(result);
            });
        });
    };
});

router.get('/list', redirectLogin, function(req, res, next) { // 'redirectLogin' will now force the user to login to access that page
    let sqlquery = "SELECT * FROM users" // query database to get all the books
    // execute sql query
    db.query(sqlquery, (err, result) => {
        if (err) {
            next(err)
        }
        res.render("userlist.ejs", {userList:result})
     })
})

router.get('/logout', redirectLogin, (req,res) => {
    req.session.destroy(err => {
    if (err) {
      return res.redirect('./')
    }
    res.send('you are now logged out. <a href='+'/'+'>Home</a>');
    })
})

// Export the router so index.js can access it
module.exports = router;
