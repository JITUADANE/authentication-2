require('dotenv').config();
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const app = express();
const cookieParser = require('cookie-parser');
const methodOverride = require('method-override');
const crypto = require("crypto");
const dbConnect = require('./config/dbConnect');


app.use(methodOverride('_method')); // This enables support for `DELETE` via the `_method` query
app.use(express.json());
app.use(cookieParser());

dbConnect();


// to define the structer (blue print) in our mongodb mongoose.Schema


// So i can see on the browser i will use  view engine to EJS
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }));

// Middleware for authenticating JWT tokens
function authenticateToken(req, res, next) {
    const token = req.cookies.token;
    if (!token) return res.status(401).send('Token missing, please log in'); // so you have a save web so ppl cant asscess it with out the password

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        console.log('JWT Secret:', process.env.ACCESS_TOKEN_SECRET); 
        if (err) return res.status(403).send('Invalid token');
        req.user = user; // Attach decoded user info to request
        next();
    });
}

function authorizeRoles(roles) {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).send('Access Denied');
        }
        next();
    };
}



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

// creat a new user but with a role
app.post('/users', async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const user = new User({
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword,
            role: req.body.role || 'Attendee',
        });

        // to save on our db
        await user.save();
        res.status(201).send(user);
    } catch (err) {
        res.status(400).send(err.message);
    }
});

/// read 
app.get('/users', authenticateToken, authorizeRoles(['Admin']), async (req, res) => {
    try {
        const users = await User.find(); // find from mdb
        res.send(users);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

//update by id 
app.put('/users/:id', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.params.id); // find by id
        if (!user) return res.status(404).send('User not found');

        user.name = req.body.name || user.name; // update
        user.email = req.body.email || user.email;
        user.role = req.body.role || user.role;
        await user.save(); // until save wait

        res.send(user);
    } catch (err) {
        res.status(400).send(err.message);
    }
});

// delete 
app.delete('/users/:id', authenticateToken, authorizeRoles(['Admin']), async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).send('User not found');
        res.send('User deleted successfully');
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.delete('/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect('/login');
});

app.listen(5001, () => {
    console.log('Server is running on port 5001');
});
