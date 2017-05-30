var express = require('express');

var Activity = require('./../models/activity'),
  Unit = require('./../models/unit');

var router = express.Router(),
  verifyAuthorization = require('./../middleware/verifyAuthorization');

router.get('/new', verifyAuthorization, (req, res) => {
  Activity.find({}).then((activities) => {
  res.render('points/new'), {activities}});
})

module.exports = router;
