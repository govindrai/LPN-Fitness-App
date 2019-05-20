// if a logged in user is trying to go to the home page, take them to their family page
const logger = require('../utils/logger');

module.exports = async function sendToHome(req, res, next) {
  logger.log('info:middleware:sendToHome');

  // if there is no active challenge redirect to the user's profile page
  // otherwise redirect them to their family's challenge page
  if (!res.locals.currentChallenge) {
    res.redirect(`/users/${res.locals.user._id}`);
  } else {
    res.locals.home = `/families/${res.locals.user.family.name}`;
    res.redirect(res.locals.home);
  }
};
