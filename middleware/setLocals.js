// Models
const Challenge = require('./../models/challenge');
const logger = require('../utils/logger');

module.exports = async function setLocals(req, res, next) {
  logger.entered('middleware:setLocals');

  // needed in layout view for building link hrefs
  res.locals.path = req.path;
  if (!res.locals.user) {
    logger.info('middleware:setLocals', 'Skipping -- guest user');
    return next();
  }

  res.locals.familyColors = {
    Topaz: '#f2cd46',
    Sunstone: '#faa152',
    Ruby: '#f83b54',
    Alexandrite: '#cb51d7',
    Iolite: '#6456f8',
    Sapphire: '#3b8df8',
    Emerald: '#24ab60',
    Bye: 'inherit',
  };

  res.locals.statusColors = {
    Winning: '#0b8c0b',
    Losing: '#d92b3a',
    Tied: 'brown',
  };

  res.locals.gradients = {
    Topaz: 'linear-gradient(135deg, #fbf0c7, #fad0ad)',
    Sunstone: 'linear-gradient(135deg, #fde2cb, #fdbbb1)',
    Ruby: 'linear-gradient(135deg, #fcc4cb, #fdacd0)',
    Alexandrite: 'linear-gradient(135deg, #f3d6f2, #d8b1f3)',
    Iolite: 'linear-gradient(135deg, #dfd9fd, #b3c6fd)',
    Sapphire: 'linear-gradient(135deg, #c4dcfc, #aceafd)',
    Emerald: 'linear-gradient(135deg, #bde5cf, #a8e6af)',
  };

  res.locals.futureChallenges = await Challenge.getFutureChallenges();
  res.locals.registerableChallengesCount = await res.locals.user.getRegisterableChallengesCount(res.locals.futureChallenges);
  res.locals.currentChallenge = await Challenge.getCurrentChallenge();
  return next();
};
