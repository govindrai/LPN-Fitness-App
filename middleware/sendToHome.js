// if a logged in user is trying to go to the home page, take them to their family page
const logger = require('../utils/logger');

module.exports = function sendToHome(req, res, next) {
  logger.log('info:middleware:sendToHome');
  if (!res.locals.user) {
    return next();
  }
  res.locals.home = `/families/${res.locals.user.family.name}`;
  if (req.path === '/') {
    res.redirect(res.locals.home);
  }
};
