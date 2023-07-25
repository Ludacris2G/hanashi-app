const express = require('express');
const router = express.Router();
const { register, verifyToken } = require('../controllers/auth');

router.post('/register', register);
router.get('/profile', verifyToken);

module.exports = router;
