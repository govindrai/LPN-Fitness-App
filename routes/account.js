// Modules
const express = require('express');

// Models
const User = require('./../models/user');

// Middleware
const isAdmin = require('./../middleware/isAdmin');

const router = express.Router();

// GET admin settings page to change admin access
router.get('/admin-settings', isAdmin, function(req, res, next) {
  let adminss, nonAdminss;
  User.getAdmins()
    .then(admins => {
      adminss = admins;
      return User.getNonAdmins();
    })
    .then(nonAdmins => {
      nonAdminss = nonAdmins;
      res.render('account/admin_settings', {
        admins: adminss,
        nonAdmins: nonAdminss,
        path: req.path
      });
    });
});

module.exports = router;
