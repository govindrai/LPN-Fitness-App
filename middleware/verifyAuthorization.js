// Models

const User = require('./../models/user');
const logger = require('../utils/logger');

// check if the user is logged in
module.exports = async function verifyAuthorization(req, res, next) {
  logger.log('info:middlware:verifyAuthorization');

  if (!req.session) {
    next(new Error('Sessions are not working...'));
  }

  if (req.session.accessToken) {
    const user = await User.decodeAuthorizationToken(req.session.accessToken, req.session.refreshToken);

    if (!user) {
      // TODO: ISSUE 403 and send to login and print message invalid jwt
      return res.status(403).send('Invalid JWT Supplied');
    }
    res.locals.user = user;
    res.locals.isLoggedIn = !!user;
  }
  return next();
};
