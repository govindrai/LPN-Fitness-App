// Modules
const express = require('express');
const _ = require('lodash');

// Models
const User = require('./../models/user');
const Family = require('./../models/family');

const logger = require('../utils/logger');
const { wrap } = require('../utils/utils');

const router = express.Router();

router.get(
  '/register',
  wrap(async (req, res, next) => {
    // if a registered user is trying to hit this route, send them to their home page
    if (res.locals.isAuthenticated) {
      res.redirect(res.locals.homePath);
    }
    // Need families for registration form (not equal to bye (ne));
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
    return res.redirect(res.locals.homePath);
  }
  res.render('sessions/new', { loggedOut: req.query.loggedOut === 'true' });
});

router.get(
  '/',
  wrap(async (req, res, next) => {
    if (res.locals.isAuthenticated) {
      // TODO: this link in the header view should be changed to this redirect when user is signed in and there is no current challenge
      return res.redirect(res.locals.homePath);
    }

    res.render('sessions/new', { loggedOut: req.query.loggedOut, title: 'Login' });
  })
);

// TODO: reetry on connection errors

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
      res.redirect('/');
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
      res.redirect('/');
    } catch (e) {
      if (e.errors) {
        if (e.name === 'ValidationError') {
          if (e.errors.family && e.errors.family.name === 'CastError') {
            e.errors.family.message = 'Please select your family from the list above.';
          }
          const families = await Family.find().ne('name', 'Bye');
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
      logger.info('route:index:/logout', 'non-logged in user logging out -- redirecting to index');
      return res.redirect('/');
    }

    // TODO: turn this into "invalidate tokens" function
    await res.locals.user.update({ accessToken: null, refreshToken: null });
    req.session = null;
    res.redirect('/login?loggedOut=true');
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
