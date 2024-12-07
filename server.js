require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const methodOverride = require('method-override');
const { dbConnect } = require('./config/dbConnect');
const authRoutes = require('./routers/authRoutes');
const userRoutes = require('./routers/userRoutes');
const eventRoutes = require('./routers/eventRoutes');
const ticketRoutes = require('./routers/ticketRoutes');
const { authenticateToken } = require('./middlewares/authenticateToken');
const errorHandler = require('./middlewares/errorHandler');
const nodemailer = require('nodemailer');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(methodOverride('_method')); // Support DELETE via _method query
app.set('view engine', 'ejs');

// Database connection
if (typeof dbConnect === 'function') {
    dbConnect();
} else {
    console.error('dbConnect is not a function');
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/tickets', ticketRoutes);

// Static Routes for Views
app.get('/register', (req, res) => res.render('register'));
app.get('/login', (req, res) => res.render('login', { messages: {} }));
app.get('/index', authenticateToken, (req, res) => res.render('index', { user: req.user }));

// Logout route
app.delete('/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect('/login');
});

// Error handling middleware
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
