require('dotenv').config(); // Load environment variables
const express = require('express'); // Import Express
const bcrypt = require('bcrypt'); // Import bcrypt for password hashing
const jwt = require('jsonwebtoken'); // Import JSON Web Token for authentication
const cookieParser = require('cookie-parser'); // Import Cookie Parser
const methodOverride = require('method-override'); // Import Method Override for supporting HTTP verbs like DELETE
const crypto = require('crypto'); // Import Crypto for secure token generation
const { dbConnect } = require('./config/dbConnect'); // Import database connection and User model
const authRoutes = require('./routers/authRoutes'); // Import authentication routes
const userRoutes = require('./routers/userRoutes'); // Import user management routes
const nodemailer = require('nodemailer');
const eventRoutes = require("./routers/eventRoutes");

const { authenticateToken} = require('./middlewares/authenticateToken');
const { authorizeRoles }  = require('./middlewares/authorizeRoles');
//<<<<<<< HEAD
const User = require('./models/user')
const errorHandler = require('./middlewares/errorHandler');


const app = express(); // Initialize Express app

app.use("/api/events", eventRoutes); // Base URL for event routes
app.use(errorHandler);
// =======

// >>>>>>> e3bfbda9044f2ab65b1a401d67dedc9c99adedda

// Middleware setup
app.use(express.json()); // Parse JSON request bodies
app.use(cookieParser()); // Parse cookies from requests
app.use(methodOverride('_method')); // Support DELETE via `_method` query

// Route setup
app.use('/api/auth', authRoutes); // Use authentication routes
app.use('/api/users', userRoutes); // Use user management routes (different prefix)
app.use("/api/events", eventRoutes); 



console.log(dbConnect); // Log the dbConnect function definition to check if it’s imported correctly

// Check if dbConnect is a function
if (typeof dbConnect === 'function') {
    dbConnect(); // Call the dbConnect function if it's correctly imported
} else {
    console.error('dbConnect is not a function');
}

// to define the structer (blue print) in our mongodb mongoose.Schema


// Create transporter
const transporter  = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: 'your_email@gmail.com',
        pass: 'generated_app_password' // You should use an app-specific password here
    }
});

// Send email
transporter.sendMail({
    to: 'who_to_send_to@your_domain.com',
    subject: 'My subject',
    html: '<h1>Hello, how are you? You have successfully logged in to Spotlink Event!</h1>'
})
.then(() => {
    console.log("Email sent");  // Corrected to use parentheses
})
.catch((err) => {
    console.error(err);  // Corrected to handle errors properly
});

/////


// So i can see on the browser i will use  view engine to EJS

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }));
// Middleware for authenticating JWT tokens




// to print registration page
app.get('/register', (req, res) => {
    res.render('register');
});

// print  login page
app.get('/login', (req, res) => {
    res.render('login', { messages: {} });
});

app.get('/index', authenticateToken, (req, res) => {
    res.render('index', { user: req.user });
});
  

// to accept or register a new user based on role
app.post('/register', async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const role = req.body.role || 'Attendee';

        // Save user to MongoDB
        const user = new User({ 
            name: req.body.name, 
            email: req.body.email,
            userName: req.body.userName,
            password: hashedPassword,
            role: role
        });

        await user.save();

        // this will send us to login page after successful registration
        res.redirect('/login');
    } catch (error) {
        res.status(500).send('Error registering user: ' + error.message);
    }
});

// login route to authenticate user from MongoDB
app.post('/login', async (req, res) => {
    try {
        // Find the user in MongoDB by email
        const user = await User.findOne({ email: req.body.email });

        if (!user) {
            return res.status(400).render('login', { messages: { error: 'Cannot find user' } });
        }

        // Verify password
        const passwordMatch = await bcrypt.compare(req.body.password, user.password);
        if (!passwordMatch) {
            return res.status(403).render('login', { messages: { error: 'Invalid credentials' } });
        }

        // Generate JWT token
        const accessToken = jwt.sign({ 
            id: user._id, 
            name: user.name, 
            role: user.role 
        }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '2h' });
        console.log("Generated JWT Token:", accessToken);

        // Set the token in a cookie
        res.cookie('token', accessToken, { httpOnly: true });

        // now we get to the index page depending on our role and password
        res.redirect('/index');
    } catch (err) {
        console.error('Error during login:', err);
        res.status(500).send('Internal Server Error');
    }
});



app.delete('/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect('/login');
});

app.listen(5001, () => {
    console.log('Server is running on port 5001');
});
