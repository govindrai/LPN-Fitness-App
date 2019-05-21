const jwt = require('jsonwebtoken');

// Models
const User = require('../models/user');
const logger = require('../utils/logger');
const { wrap } = require('../utils/utils');

const keys = require('../config/keys');

// check if the user is logged in
module.exports = wrap(verifyAuthorization);

async function verifyAuthorization(req, res, next) {
  logger.log('info:middlware:verifyAuthorization');

  if (!req.session) {
    next(new Error('Sessions are not working...'));
  }

  let user;

  if (req.session.accessToken) {
    const accessTokenRes = await verifyToken(req.session.accessToken);
    if (accessTokenRes === 'TokenExpired') {
      logger.log('info:middleware:verifyAuthorization', 'Access token is expired. Verifying refresh token');
      const refreshTokenRes = await verifyToken(req.session.accessToken);
      if (refreshTokenRes === 'TokenExpired') {
        logger.log('info:middleware:verifyAuthorization', 'Refresh token is also expired. Invalidating tokens and redirecting to /login');
        req.session.accessToken = null;
        req.session.refreshToken = null;
        return res.redirect('/login?expiredSession=true');
      }
      user = await User.findOne({ _id: refreshTokenRes.data.userId, refreshToken: req.session.refreshToken });
      if (!user) {
        logger.log(
          'info:middleware:verifyAuthorization',
          'Could not find user with _id and refreshtoken. Invalidating tokens and redirecting to login'
        );
        req.session.accessToken = null;
        req.session.refreshToken = null;
        return res.redirect('/login?expiredSession=true');
      }
      logger.log('info:middleware:verifyAuthorization', 'Valid refresh token. Generating new tokens');
      const tokens = await user.generateAccessTokens();
      [req.session.accessToken, req.session.refreshToken] = tokens;
    } else {
      user = await User.findOne({ _id: accessTokenRes.data.userId, accessToken: req.session.accessToken }).populate('family');
      if (!user) {
        logger.log(
          'info:middleware:verifyAuthorization:',
          'Could not find user with _id and access token. Invalidating tokens and redirecting to login'
        );
        req.session.accessToken = null;
        req.session.refreshToken = null;
        return res.redirect('/login?expiredSession=true');
      }
      logger.log('info:middleware:verifyAuthorization:', 'Access token valid. User authenticated');
    }

    res.locals.user = user;
    res.locals.isLoggedIn = true;
  }
  return next();
}

function verifyToken(token) {
  logger.log('info:middleware:helper:verifyToken');
  return new Promise((resolve, reject) => {
    jwt.verify(token, keys.JWT_SECRET, (err, decodedToken) => {
      if (err) {
        if (err.name === 'TokenExpiredError') {
          resolve('TokenExpired');
        } else {
          reject(err);
        }
      }
      resolve(decodedToken);
    });
  });
}
