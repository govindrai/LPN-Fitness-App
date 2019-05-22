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
// confusing because you should only be able to change your profile but you can make someone else an admin if you are an admin
router.put(
  '/:id',
  wrap(async (req, res, next) => {
    if (req.body.changeAdmin) {
      if (!res.locals.user.admin) {
        // TODO: send the rigth error message back to view
        return res.send('ONLY ADMINS BE ALLOWED TO ACCESS THIS BRO');
      }
      // TODO: Make this a server side operation, no need to retrieve user
      const user = await User.findById(req.body.userId);
      await user.update({ $set: { admin: !user.admin } });
      return res.send(`${user.fullName} ${user.admin ? 'is now an admin' : 'is no longer an admin'}`);
    }

    const body = _.pick(req.body, ['name.first', 'name.last', 'name.nickname', 'email', 'password']);
    const isEmailUnmodified = res.locals.user.email === body.email;
    const isPasswordUnmodified = body.password === '';

    if (isEmailUnmodified) {
      delete body.email;
    }

    if (isPasswordUnmodified) {
      delete body.password;
    } else {
      res.locals.user.password = body.password;
      await res.locals.user.hashPassword();
      body.password = res.locals.user.password;
    }

    await res.locals.user.update({ $set: body }, { new: true, runValidators: true });
    res.redirect(`/users/${res.locals.user._id}?updated=true`);
  })
);

// GET a user's landing page
router.get(
  '/:id',
  wrap(async (req, res, next) => {
    const ranksProm = res.locals.user.getRankedUser();
    const numOfChallengesCompletedProm = res.locals.user.getNumOfChallengesCompleted(res.locals.currentChallenge);
    const [numOfChallengesCompleted] = await Promise.all([numOfChallengesCompletedProm, ranksProm]);
    // TODO: the view name should be different and should redirect to a user's personal landing page when there are no challenges. :)
    return res.render('families/no_challenge', { numOfChallengesCompleted });
  })
);

// TODO: add private route middleware
// router.get(
//   '/:id/edit',
//   wrap(async (req, res, next) => {
//     // TODO: don't do a lookup if the user is looking at their own profile
//     // Better yet build a caching on top of all mongodb actions and save yourself from this logic
//     let user;
//     if (res.locals.user._id.equals(req.params.id)) {
//       ({ user } = res.locals);
//     } else {
//       user = await User.findById(req.params.id).populate('family');
//     }

//     res.render('users/show', {
//       user,
//       currentUser: res.locals.user,
//       successMessage: req.query.updated,
//     });
//   })
// );

module.exports = router;
