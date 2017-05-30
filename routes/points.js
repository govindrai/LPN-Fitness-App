var express = require('express');

var Activity = require('./../models/activity'),
  Point = require('./../models/point');

var router = express.Router(),
  verifyAuthorization = require('./../middleware/verifyAuthorization');

router.get('/new', verifyAuthorization, (req, res) => {
  Activity.find({}).then((activities) => {
    Point.find({}).populate('activityId').then((points) => {
      res.render('points/new'), {points, activities}
    });
})
});

module.exports = router;
