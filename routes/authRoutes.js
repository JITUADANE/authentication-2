const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken, checkRole } = require('../middlewares/authMiddleware');

// Public Routes
router.get('/register', (req, res) => {
    res.render('registration'); // Render the registration page
});

router.post('/register', authController.registerUser);

router.get('/login', (req, res) => {
    res.render('login', { messages: { error: req.query.error } }); // Pass error messages if any
});

router.post('/login', authController.loginUser);  // Ensure that this matches your controller

// Protected Routes
router.get('/index', verifyToken, (req, res) => {
    res.render('index', { user: req.user }); // Render the index page after successful login
});

// Logout Route
router.post('/logout', verifyToken, authController.logoutUser);

module.exports = router;
