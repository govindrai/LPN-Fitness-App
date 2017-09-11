// Modules
const express = require('express'),
  _ = require('lodash'),
  pug = require('pug'),
  path = require('path');

// Models
const User = require('./../models/user'),
  Family = require('./../models/family');

const router = express.Router();

router.post('/', (req, res, next) => {
  var user = new User(req.body);
  user
    .save()
    .then(user => {
      user.generateAuthToken().then(token => {
        res.redirect('/families');
      });
    })
    .catch(e => console.log(e));
});

// GET user profile edit form
router.get('/edit', function(req, res, next) {
  User.findById(res.locals.user._id).then(user => {
    res.render('users/edit', { user, path: res.path });
  });
});

// initialize new user, if save successful,
// generate auth token and take to home page
router.post('/', (req, res, next) => {
  var user = new User(req.body);

  user
    .save()
    .then(user => {
      user.generateAuthToken().then(token => {
        res.redirect('/families/');
      });
    })
    .catch(e => console.log(e));
});

// handles both admin changes as well as profile edits
router.put('/edit', (req, res) => {
  if (req.body.changeAdmin) {
    if (!res.locals.user.admin)
      res.status(400).send('You must be an admin to access this feature');
    User.findById(req.body.user)
      .then(user => {
        user.admin = !user.admin;
        return user.update({ $set: { admin: user.admin } });
      })
      .then(user =>
        res.send(
          `${user.fullName} ${user.admin
            ? 'is now an admin'
            : 'is no longer an admin'}`
        )
      )
      .catch(e => console.log(e));
  } else {
    const body = _.pick(req.body, [
      'name.first',
      'name.last',
      'name.nickname',
      'email',
      'password'
    ]);

    const emailNotModified = res.locals.user.email === body.email;
    const passwordNotModified = body.password === '';

    if (emailNotModified) {
      delete body.email;
    }
    const promisesArray = [];

    let hashPasswordPromise;

    if (passwordNotModified) {
      delete body.password;
    } else {
      hashPasswordPromise = function() {
        return User.hashPassword(body.password).then(
          hash => (body.password = hash)
        );
      };
    }

    updateUserPromise = function() {
      return User.findOneAndUpdate(
        { _id: res.locals.user._id },
        { $set: body },
        { new: true, runValidators: true }
      )
        .then(user => {
          return res.render('users/edit', {
            user,
            successMessage: 'Your profile has been updated!'
          });
        })
        .catch(e => console.log(e));
    };

    if (hashPasswordPromise) {
      hashPasswordPromise().then(() => updateUserPromise());
    } else {
      updateUserPromise();
    }
  }
});

router.get('/:email', (req, res, next) => {
  User.findOne({ email: req.params.email })
    .populate('family')
    .then(user => {
      res.render('users/show', { user, currentUser: res.locals.user });
    });
});

module.exports = router;
