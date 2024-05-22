const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const path = require('path');
const session = require('express-session');
const app = express();
const port = 5511; 

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/passwordDb', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected...'))
    .catch(err => console.log(err));

// User Schema
const userSchema = new mongoose.Schema({
    username: { type: String, unique: true },
    password: String
});

const User = mongoose.model('User', userSchema); 
// Middleware to parse JSON and form data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Use express-session for session management
app.use(session({
    secret: 'yourSecretKey', 
    resave: false, 
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using https
}));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Serve the login page
app.get('/', (req, res) => {
    if (req.session.user) {
        res.redirect('/x.html');
    } else {
        res.sendFile(path.join(__dirname, 'public', 'login.html'));
    }
});

// Handle user signup
app.post('/signup', async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const user = new User({
            username: req.body.username,
            password: hashedPassword
        });
        await user.save();
        res.json({ success: true, message: 'Signup successful. Please login.' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error signing up. Please try again.' });
    }
});

// Handle user login
app.post('/login', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.body.username });
        if (user && await bcrypt.compare(req.body.password, user.password)) {
            req.session.user = user; // Save user in session
            res.json({ success: true, message: 'Login successful.', redirect: '/x.html' });
        } else {
            res.json({ success: false, message: 'Incorrect username or password. Please try again or sign up.' });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error logging in. Please try again.' });
    }
});

// Handle forgot password (this is just a placeholder, you can implement actual logic)
app.post('/forgot-password', (req, res) => {
    // Implement password recovery logic here
    res.send('Password recovery instructions have been sent to your email.');
});

// Serve the index page upon successful login
app.get('/x.html', (req, res) => {
    if (req.session.user) {
        res.sendFile(path.join(__dirname, 'public', 'x.html'));
    } else {
        res.redirect('/');
    }
});

// Handle user logout
app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Error logging out. Please try again.' });
        }
        res.redirect('/');
    });
});
// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

