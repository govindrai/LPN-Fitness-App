const jwt = require('jsonwebtoken');

// Models
const User = require('../models/user');
const Logger = require('../utils/logger');
const { wrap } = require('../utils/utils');

const keys = require('../config/keys');

const logger = new Logger('middleware:verifyAuthorization');

// check if the user is logged in
module.exports = wrap(verifyAuthorization);

async function verifyAuthorization(req, res, next) {
  logger.entered();

  if (!req.session) {
    next(new Error('Sessions are not working...'));
  }

  let user;

  if (req.session.accessToken) {
    const accessTokenRes = await verifyToken(req.session.accessToken);
    if (accessTokenRes === 'TokenExpired') {
      logger.info(null, 'Access token is expired. Verifying refresh token');
      const refreshTokenRes = await verifyToken(req.session.refreshToken);

      if (refreshTokenRes === 'TokenExpired') {
        logger.info('Refresh token is also expired. Invalidating tokens and redirecting to /login');
        req.session.accessToken = null;
        req.session.refreshToken = null;
        return res.render('session/new', { error: 'Your session has expired. Please log in' });
      }

      user = await User.findOne({ _id: refreshTokenRes.data.userId, refreshToken: req.session.refreshToken });

      if (!user) {
        logger.log(
          'info:middleware:verifyAuthorization',
          'Could not find user with _id and refreshtoken. Invalidating tokens and redirecting to login'
        );
        req.session.accessToken = null;
        req.session.refreshToken = null;
        return res.render('session/new', { error: 'Your session has expired. Please log in' });
      }

      logger.info(null, 'Valid refresh token. Generating new tokens');
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
        return res.render('sessions/new', { error: 'Your session has expired. Please log in' });
      }

      logger.info(null, 'Access token valid. User authenticated');
    }

    res.locals.user = user;
    res.locals.isAuthenticated = true;
    return next();
  }

  logger.info(null, 'User is a guest');
  return next();
}

function verifyToken(token) {
  logger.info('helper:verifyToken', 'Entered verifyToken');
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
