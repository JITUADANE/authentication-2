const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        // Redirect to login page if no token found
        return res.redirect('/login'); 
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) {
            // Redirect to login page if token is invalid
            return res.redirect('/login');
        }
        req.user = user; // Attach user data from token to the request
        next();
    });
};

module.exports = { authenticateToken };
