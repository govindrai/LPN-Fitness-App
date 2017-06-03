// Modules
var express = require('express');

// Models
var Activity = require('./../models/activity'),
  Point = require('./../models/point'),
  Challenge = require('./../models/challenge'),
  Participation = require('./../models/participation')
  Unit = require('./../models/unit');

var router = express.Router()

router.get('/new', (req, res) => {
  Activity.find({}).then((activities) => {
    Point.find({}).populate('activity').then((points) => {
      var activitiesArray = [];
      res.render('points/new', {points, activities});
    });
  })
  .catch(e => console.log(e));
});

router.post('/', (req, res) => {
  var body = _.pick(req.body, ["_id"]);
  var point = new Point({
      participation: participation._id
      activity: activity._id  
    });
  point.save()
  .then(() => {
		res.redirect('/');
	}).catch((e) => console.log(e))
  })
});

module.exports = router;
