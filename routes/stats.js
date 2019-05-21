// Modules
const express = require('express');

// Models
const User = require('../models/user');

// Middleware
const isAdmin = require('../middleware/isAdmin');

const { wrap } = require('../utils/utils');
const logger = require('../utils/logger');

const router = express.Router();

router.get(
  '/',
  wrap(async (req, res, next) => {
    logger.log('info:rquest', req.path);
    const users = await User.getRankedUsers();
    res.render('stats/index', { users });
  })
);

module.exports = router;
