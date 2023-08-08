const express = require('express');
const app = express();
const path = require('path');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const db = require('./db');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const saltRounds = 10;

const sessionStore = new MySQLStore(db);

app.use(session({
    key: 'session_cookie_name',
    secret: 'session_cookie_secret',
    store: sessionStore,
    resave: false,
    saveUninitialized: false
}));

app.use(express.static(path.join(__dirname)));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// default route
app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(3000, function () {
    console.log('App listening on port 3000');
});

// Sign-up route
app.post('/api/signup', function(req, res) {
    let username = req.body.username;
    let password = req.body.password;

    // Hash the password
    bcrypt.hash(password, saltRounds, function(err, hash) {
        // Store the username and hashed password in the database
        let sql = "INSERT INTO users (username, password) VALUES (?, ?)";
        db.query(sql, [username, hash], function(err, result) {
            if (err) {
                res.status(500).send('Error signing up');
            } else {
                res.send('User signed up');
            }
        });
    });
});

// Sign-in route
app.post('/api/signin', function(req, res) {
    let username = req.body.username;
    let password = req.body.password;

    // Get the user's hashed password from the database
    let sql = "SELECT password FROM users WHERE username = ?";
    db.query(sql, [username], function(err, rows) {
        if (err || rows.length === 0) {
            // The user does not exist
            res.status(401).send('Invalid username');
        } else {
            // Compare the provided password with the stored hash
            bcrypt.compare(password, rows[0].password, function(err, result) {
                if (result) {
                    res.send('User signed in');
                } else {
                    // The passwords don't match, authentication failed
                    res.status(401).send('Invalid password');
                }
            });
        }
    });
});

/*app.get('/api/current_user', (req, res) => {
    if(req.session && req.session.username) {
        res.json({ loggedIn: true, username: req.session.username });
    } else {
        res.json({ loggedIn: false });
    }
});*/
