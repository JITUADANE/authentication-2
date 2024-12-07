const jwt = require('jsonwebtoken');
require('dotenv').config();

const authenticateUser = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1]; 
    
    if (!token) {
        return res.status(401).send('Access Denied: No token provided');
    }

    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(403).send('Invalid token');
    }
};

module.exports = authenticateUser;
