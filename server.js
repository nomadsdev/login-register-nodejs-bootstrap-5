const express = require('express');
const mysql = require('mysql');
const session = require('express-session');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const serverrun = `Server is running ${PORT}`;

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_DATA
});

db.connect((err) => {
    if (err) {
        console.error('Error Connection to database')
    } else {
        console.log('Connected to database');
    }
});

app.get('/', (req, res) => {
    res.render('login', { error: null });
});

app.get('/register', (req, res) => {
    res.render('register', { error: null });
});

app.post('/auth', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const sqlLogin = `SELECT * FROM users WHERE username = ? AND password = ?`;

    if (username && password) {
        db.query(sqlLogin, [username, password], (err, results, fields) => {
            if (results.length > 0) {
                req.session.loggedin = true;
                req.session.username = username;
                res.redirect('/home');
            } else {
                res.render('login', { error: 'Incorrect Username and/or Password!' });
            }
        });
    } else {
        res.render('login', { error: 'Please enter Username and Password!' });
    }
});

app.post('/register', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const sqlRegister = `INSERT INTO users (username, password) VALUES (?, ?)`;

    if (username && password) {
        db.query(sqlRegister, [username, password], (err, results, fields) => {
            if (err) {
                res.render('register', { error: 'Error registering user. Please try again.' });
            } else {
                res.redirect('/');
            }
        });
    } else {
        res.render('register', { error: 'Please enter Username and Password!' });
    }
});

app.get('/home', (req, res) => {
    if (req.session.loggedin) {
        res.render('home')
    } else {
        res.redirect('/')
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.log(err);
        } else {
            res.redirect('/');
        }
    });
});

app.listen(PORT, () => {
    console.log(serverrun);
});