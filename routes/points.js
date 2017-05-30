var express = require('express');

var Activity = require('./../models/activity'),
  Unit = require('./../models/unit');

var router = express.Router(),
  verifyAuthorization = require('./../middleware/verifyAuthorization');

router.get('/new', verifyAuthorization, (req, res) => {
  res.render('points/new');
})

module.exports = router;