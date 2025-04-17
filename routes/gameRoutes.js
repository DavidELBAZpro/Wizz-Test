const express = require('express');
const { searchGames } = require('../controllers/gameController');

const router = express.Router();

router.post('/search', searchGames);

module.exports = router;