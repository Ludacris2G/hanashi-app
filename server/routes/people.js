const express = require('express');
const { getPeople } = require('../controllers/people');
const router = express.Router();

router.get('/people', getPeople);

module.exports = router;
