var express = require('express'),
  _ = require('lodash');

var User = require('./../models/user'),
  Family = require('./../models/family');

var router = express.Router();

// Landing & Registration Page
router.get('/new', (req, res) => {
    res.render('sessions/new');
});

module.exports = router;
