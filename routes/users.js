// Create a new router
const express = require("express");
const router = express.Router();
const bcrypt = require('bcrypt');
const saltRounds = 10;

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

        if (results.length > 0) {
            const hashedPassword = results[0].hashedPassword;

            // Compare the password supplied with the hashed password from the database
            bcrypt.compare(plainPassword, hashedPassword, function (err, result) {
                if (err) {
                    return next(err); // Handle bcrypt error
                }
                
                if (result === true) {
                    res.send('Login successful!');
                } else {
                    res.send('Incorrect password!');
                }
            });
        } else {
            res.send('User not found!');
        }
    });
});

router.get('/register', function (req, res, next) {
    res.render('register.ejs');
});

router.post('/registered', function (req, res, next) {
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

            let result = 'Hello ' + req.body.first + ' ' + req.body.last + ', you are now registered! We will send an email to you at ' + req.body.email;
            result += '. Your password is: ' + req.body.password + ' and your hashed password is: ' + hashedPassword;
            res.send(result);
        });
    });
});

router.get('/list', function(req, res, next) {
    let sqlquery = "SELECT * FROM users" // query database to get all the books
    // execute sql query
    db.query(sqlquery, (err, result) => {
        if (err) {
            next(err)
        }
        res.render("userlist.ejs", {userList:result})
     })
})

// Export the router object so index.js can access it
module.exports = router;
