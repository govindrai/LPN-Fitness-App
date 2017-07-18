// Modules
const express = require('express'),
  mongoose = require('./../db/mongoose');

// Models
const User = require('./../models/user');

// Middleware
const isAdmin = require('./../middleware/isAdmin');

const router = express.Router();

// GET accounts index page and user profile edit form
router.get('/', function(req, res, next) {
  User.findById(res.locals.user._id).then(user => {
    res.render('users/edit', { user });
  });
});

// GET admin settings page to change admin access
router.get('/admin-settings', isAdmin, function(req, res, next) {
  var adminss, nonAdminss;
  User.getAdmins()
    .then(admins => {
      adminss = admins;
      return User.getNonAdmins();
    })
    .then(nonAdmins => {
      nonAdminss = nonAdmins;
      res.render('account/admin_settings', { admins: adminss, nonAdmins: nonAdminss });
    });
});

module.exports = router;
