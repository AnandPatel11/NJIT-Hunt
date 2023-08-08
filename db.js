require('dotenv').config();

const mysql = require('mysql');

// Configure your MySQL connection
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});



// Connect to the database
db.connect(function(err) {
    if (err) throw err;
    console.log("Connected to the database!");
});

// Export the connection
module.exports = db;
