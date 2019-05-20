// Modules
const express = require('express');
const _ = require('lodash');
// const pug = require('pug');
// const path = require('path');

// Models
const User = require('./../models/user');
// const Family = require('./../models/family');
const Point = require('./../models/point');

// Middleware
const isAdmin = require('./../middleware/isAdmin');

const logger = require('../utils/logger');
const { wrap } = require('../utils/utils');

const router = express.Router();

router.get('/admin-settings', isAdmin, (req, res, next) => {
  let adminss;
  let nonAdminss;
  User.getAdmins()
    .then(admins => {
      adminss = admins;
      return User.getNonAdmins();
    })
    .then(nonAdmins => {
      nonAdminss = nonAdmins;
      res.render('users/admin_settings', {
        admins: adminss,
        nonAdmins: nonAdminss,
        path: req.path,
      });
    });
});

// edit points for a user for certain day
router.put('/points', (req, res) => {
  const { participant } = req.body;
  // res.locals.user.participantId = participant;
  const addPointsButtonDate = new Date(req.body.addPointsButtonDate);
  const familyParticipants = [{ _id: participant, user: res.locals.user }];
  Point.calculateParticipantPointsByDay(familyParticipants, addPointsButtonDate, res.locals.user)
    .then(() => res.render('points/_points_entries', {
        familyParticipants,
        // addPointsButtonDate,
        // editRequest: true
      }))
    .catch(e => console.log(e));
});

// GET user profile edit form
router.get('/:id/edit', (req, res) => res.render('users/edit'));

// handles both admin changes as well as profile edits
router.put('/:id', (req, res) => {
  if (req.body.changeAdmin) {
    User.findById(req.body.userId)
      .then(user => user.update({ $set: { admin: !user.admin } }))
      .then(user => res.send(`${user.fullName} ${user.admin ? 'is now an admin' : 'is no longer an admin'}`))
      .catch(e => console.log(e));
  } else {
    const body = _.pick(req.body, ['name.first', 'name.last', 'name.nickname', 'email', 'password']);

    const emailNotModified = res.locals.user.email === body.email;
    const passwordNotModified = body.password === '';

    if (emailNotModified) {
      delete body.email;
    }
    let hashPasswordPromise;

    if (passwordNotModified) {
      delete body.password;
    } else {
      hashPasswordPromise = function () {
        return User.hashPassword(body.password).then(hash => (body.password = hash));
      };
    }

    const updateUserPromise = function () {
      return User.findOneAndUpdate({ _id: res.locals.user._id }, { $set: body }, { new: true, runValidators: true })
        .then(user => res.redirect(`/users/${user.email}?updated=true`))
        .catch(e => console.log(e));
    };

    if (hashPasswordPromise) {
      hashPasswordPromise().then(() => updateUserPromise());
    } else {
      updateUserPromise();
    }
  }
});

// GET a user's landing page
router.get(
  '/:id',
  wrap(async (req, res, next) => {
    // TODO: this should redirect to a user's personal landing page when there are no challenges. :)
    const ranks = await res.locals.user.getRanks();
    return res.render('families/no_challenge', { ranks });
  })
);

// TODO: add private route middleware
router.get(
  '/:id/edit',
  wrap(async (req, res, next) => {
    // TODO: don't do a lookup if the user is looking at their own profile
    // Better yet build a caching on top of all mongodb actions and save yourself from this logic
    let user;
    if (res.locals.user._id.equals(req.params.id)) {
      ({ user } = res.locals);
    } else {
      user = await User.findById(req.params.id).populate('family');
    }

    res.render('users/show', {
      user,
      currentUser: res.locals.user,
      successMessage: req.query.updated,
    });
  })
);

module.exports = router;
