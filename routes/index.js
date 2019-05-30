// Modules
const express = require('express');
const _ = require('lodash');

// Models
const User = require('./../models/user');
const Family = require('./../models/family');
const Challenge = require('./../models/challenge');

const Logger = require('../utils/logger');
const { wrap } = require('../utils/utils');

const sendToHome = require('../middleware/sendToHome');

const logger = new Logger('route:index');
const router = express.Router();

router.get(
  '/register',
  wrap(async (req, res, next) => {
    // if a registered user is trying to hit this route, send them to their home page
    if (res.locals.isAuthenticated) {
      return sendToHome(req, res, next);
    }
    // Need families for registration form (not equal to by (ne));
    const families = await Family.find().ne('name', 'Bye');
    res.render('users/new', {
      families,
      user: new User(),
      title: 'Register',
    });
  })
);

router.get('/login', (req, res, next) => {
  if (res.locals.isAuthenticated) {
    return sendToHome(req, res, next);
  }
  res.render('sessions/new');
});

router.get(
  '/',
  wrap(async (req, res, next) => {
    if (res.locals.isAuthenticated) {
      // TODO: this link in the header view should be changed to this redirect when user is signed in and there is no current challenge
      return sendToHome(req, res, next);
    }

    res.render('sessions/new', { loggedOut: req.query.loggedOut, title: 'Login' });
  })
);

// POST login form data
router.post(
  '/login',
  wrap(async (req, res, next) => {
    const { email } = req.body;
    try {
      const user = await User.findOne({ email });
      if (!user) throw new AuthError();
      const isAuthenticated = await user.authenticate(req.body.password);
      if (!isAuthenticated) throw new AuthError();
      const tokens = await user.generateAccessTokens();
      [req.session.accessToken, req.session.refreshToken] = tokens;
      res.locals.user = user;
      res.locals.currentChallenge = await Challenge.getCurrentChallenge();
      return sendToHome(req, res, next);
    } catch (e) {
      if (e.name === 'AuthError') {
        return res.render('sessions/new', {
          error: e.message,
          email,
          title: 'Login',
        });
      }
      throw e;
    }
  })
);

// Register
router.post(
  '/register',
  wrap(async (req, res, next) => {
    let user;
    try {
      // TODO: remove underscore/lodash
      const body = _.pick(req.body, ['name.first', 'name.last', 'name.nickname', 'email', 'family', 'password']);
      user = new User(body);
      user = await user.save();
      req.session.accessToken = user.accessToken;
      req.session.refreshToken = user.refreshToken;
      res.locals.user = user;
      res.locals.getCurrentChallenge = await Challenge.getCurrentChallenge();
      return sendToHome(req, res, next);
    } catch (e) {
      if (e.errors) {
        if (e.name === 'ValidationError') {
          if (e.errors.family && e.errors.family.name === 'CastError') {
            e.errors.family.message = 'Please select your family from the list above.';
          }
          const families = await Family.find().ne('name', 'Bye');
          logger.log('info:new user', user);
          res.render('users/new', {
            families,
            user,
            errors: e.errors,
            title: 'Register',
          });
        }
      } else {
        throw e;
      }
    }
  })
);

// Logout (Remove JWT from user, then redirect to Home)
router.get(
  '/logout',
  wrap(async (req, res, next) => {
    if (!res.locals.user) {
      // TODO: figure out route level logging
      logger.log('info:route:/logout', 'non-logged in user logging out -- redirecting to index');
      return res.redirect('/');
    }
    // TODO: turn this into "invalidate tokens" function
    await res.locals.user.update({ accessToken: null, refreshToken: null });
    req.session = null;
    res.render('sessions/new', {
      loggedOut: true,
    });
  })
);

router.get('/schedule', (req, res) => {
  res.render('challenges/schedule', {
    standings: res.locals.currentChallenge.getStandings(),
    title: 'Standings & Schedule',
  });
});

// GET rules page
router.get('/rules', (req, res) => {
  User.find({ admin: true })
    .then(admins => res.render('sessions/rules', { admins, title: 'Rubric & Rules' }))
    .catch(e => console.log(e));
});

module.exports = router;

// PRIVATE FUNCTIONS

function AuthError(message) {
  this.name = 'AuthError';
  this.message = message || 'Incorrect Username/Password.';
  this.stack = new Error().stack;
}
AuthError.prototype = Object.create(Error.prototype);
AuthError.prototype.constructor = AuthError;
