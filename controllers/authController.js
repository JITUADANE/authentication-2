// controllers/authController.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');  // Import User model (no need to import mongoose)

exports.registerUser = async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        const user = new User({
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword,
            role: req.body.role || 'Attendee',
        });

        await user.save();
        res.status(201).json({ message: 'User registered successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Error registering user', error: error.message });
    }
};

exports.loginUser = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) return res.status(400).json({ message: 'User not found' });

        const isPasswordValid = await bcrypt.compare(req.body.password, user.password);
        if (!isPasswordValid) return res.status(401).json({ message: 'Invalid password' });

        const accessToken = jwt.sign(
            { id: user._id, name: user.name, role: user.role },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '2h' }
        );

        res.cookie('token', accessToken, { httpOnly: true });
        res.status(200).json({ message: 'Login successful', accessToken });
    } catch (error) {
        res.status(500).json({ message: 'Error logging in', error: error.message });
    }
};

exports.logoutUser = (req, res) => {
    res.clearCookie('token');
    res.status(200).json({ message: 'Logged out successfully' });
};