const express = require('express');
const { searchGames, populateGames } = require('../controllers/gameController');

const router = express.Router();

router.post('/search', searchGames);
router.get('/populate', populateGames);

module.exports = router;