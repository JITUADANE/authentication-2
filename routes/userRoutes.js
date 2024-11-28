const express = require('express');
const {
    getAllUsers,
    createUser,
    updateUser,
    deleteUser,
} = require('../controllers/userController');
const authenticateToken = require('../middleware/authenticateToken');
const authorizeRoles = require('../middleware/authorizeRoles');

const router = express.Router();

router.get('/users', authenticateToken, authorizeRoles(['Admin']), getAllUsers);
router.post('/users', authenticateToken, authorizeRoles(['Admin']), createUser);
router.put('/users/:id', authenticateToken, updateUser);
router.delete('/users/:id', authenticateToken, authorizeRoles(['Admin']), deleteUser);

module.exports = router;
