const axios = require('axios');
const db = require('../models');
const { Op } = db.Sequelize;

const searchGames = async (req, res) => {
  const { name, platform } = req.body;

  const whereClause = {};
  if (name) whereClause.name = { [Op.like]: `%${name}%` };
  if (platform) whereClause.platform = platform;

  try {
    const games = await db.Game.findAll({ where: whereClause });
    res.json(games);
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ error: 'Search failed' });
  }
};

module.exports = {
  searchGames
};
