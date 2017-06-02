var express = require('express');

var Activity = require('./../models/activity'),
  Point = require('./../models/point'),
  Unit = require('./../models/unit');

var router = express.Router(),
  verifyAuthorization = require('./../middleware/verifyAuthorization');

router.get('/new', verifyAuthorization, (req, res) => {
  Activity.find({}).then((activities) => {
    Point.find({}).populate('activity').then((points) => {
      var activitiesArray = [];
      res.render('points/new', {points, activities});
    });
  })
  .catch(e => console.log(e));
});

router.post('/', (req, res) => {
  var point = new Point(req.body)
  point.save().then((point) => {
		res.redirect('/');
	}).catch((e) => console.log(e))
});

module.exports = router;
