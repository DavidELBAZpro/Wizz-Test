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

const populateGames = async (req, res) => {
  try {
    const urls = [
      'https://interview-marketing-eng-dev.s3.eu-west-1.amazonaws.com/ios.top100.json',
      'https://interview-marketing-eng-dev.s3.eu-west-1.amazonaws.com/android.top100.json',
    ];

    const responses = await Promise.all(urls.map(url => axios.get(url)));

    // console.log('✅ All games fetched successfully', responses);

    const gamesRaw = responses.flatMap(resp => resp.data.flat());

    console.log('✅ Total games fetched:', gamesRaw.length);

    console.log('Game fetched:', gamesRaw[0]);

    const games = gamesRaw.map((game) => ({
      publisherId: game.publisher_id?.toString() || 'unknown',
      name: game.name || 'unknown',
      platform: game.os,
      storeId: (game.app_id || game.id)?.toString() || 'unknown',
      bundleId: game.bundle_id || 'unknown',
      appVersion: game.version || 'unknown',
      isPublished: !!game.release_date,    // I assume isPublished is true if a release_date exists 
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    const storeIds = games.map(game => game.storeId);
    const existingGames = await db.Game.findAll({
      where: { storeId: storeIds },
      attributes: ['storeId']
    });
    const existingStoreIds = new Set(existingGames.map(game => game.storeId));
    
    const uniqueGames = games.filter(game => !existingStoreIds.has(game.storeId));
    
    await db.Game.bulkCreate(uniqueGames);

    // await db.Game.bulkCreate(games, { ignoreDuplicates: true });

    res.status(200).json({ message: 'Games populated successfully', count: games.length });
  } catch (err) {
    console.error('Error populating games:', err);
    res.status(500).json({ error: 'Failed to populate games' });
  }
};

module.exports = {
  searchGames,
  populateGames,
};
