const express = require('express');
const router = express.Router();
const { register, verifyToken, login } = require('../controllers/auth');

router.post('/register', register);
router.get('/profile', verifyToken);
router.post('/login', login);

module.exports = router;
