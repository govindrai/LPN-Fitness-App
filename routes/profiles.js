const express = require('express');
const _ = require('lodash');
const User = require('../models/user');
const privateRoute = require('./../middleware/privateRoute');
const { wrap } = require('../utils/utils');

const router = express.Router();

router.use(privateRoute);

// TODO: don't do a lookup if the user is looking at their own profile
// Better yet build a caching on top of all mongodb actions and save yourself from this logic

// GET profile
router.get('/:id', (req, res, next) => {
  if (!res.locals.user._id.equals(req.params.id)) {
    return res.send("YOU CAN'T VIEW SOMEONE ELSE's PROFILE BRO");
  }
  return res.render('profile/show');
});

// GET profile edit form
router.get('/:id/edit', (req, res, next) => {
  if (!res.locals.user._id.equals(req.params.id)) {
    return res.send("YOU CAN'T EDIT SOMEONE ELSE's PROFILE BRO");
  }
  return res.render('profile/edit');
});

// PUT profile
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
    return res.render('profile/show', { isUpdated: true });
  })
);

module.exports = router;
