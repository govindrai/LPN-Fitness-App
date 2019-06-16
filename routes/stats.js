// Modules
const express = require('express');

// Models
const User = require('../models/user');

// Middleware
const privateRoute = require('../middleware/privateRoute');

const { wrap } = require('../utils/utils');

const router = express.Router();

router.use(privateRoute)

router.get(
  '/',
  wrap(async (req, res, next) => {
    const users = await User.getUsersByRank();
    res.render('stats/index', { users });
  })
);

module.exports = router;
