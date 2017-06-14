// Modules
var express = require('express'),
  _ = require('lodash');

// Models
var Activity = require('./../models/activity'),
  Point = require('./../models/point'),
  Unit = require('./../models/unit'),
  Challenge = require('./../models/challenge'),
  Participation = require('./../models/participation'),
  User = require('./../models/user');

var router = express.Router();


function checkParticipationInCurrentChallenge(req, res, next) {
  Challenge.getCurrentChallenge()
  .then(currentChallenge => {
    return Participation.findOne({user: res.locals.user._id, challenge: currentChallenge._id});
  })
  .then((participation) => {
    res.locals.participationId = participation._id;
    next();
  })
  .catch(e => {
    console.log("Error within checkParticipationInCurrentChallenge", e);
    res.render('sessions/unauthorized', {message: "You are not currently signed up for the current challenge"});
  });
}

router.get('/new', checkParticipationInCurrentChallenge, (req, res) => {
  Activity.find({}).then((activities) => {
    Point.find({}).populate('activity').then((points) => {
      var beginningOfDay = new Date();
      beginningOfDay.setHours(0,0,0,0);
      res.render('points/new', {points, activities, date: beginningOfDay});
    });
  })
  .catch(e => console.log(e));
});

router.post('/', (req, res) => {
  var countOfActivities = req.body.activity.length;
  var points = [];

  for (var i = 0; i < countOfActivities; i++) {
    points.push({
      participation: req.body.participation,
      user: res.locals.user._id,
      activity: req.body.activity[i],
      numOfUnits: req.body.numOfUnits[i],
      calculatedPoints: req.body.calculatedPoints[i],
      date: req.body.date
    });
  }

  Point.insertMany(points)
  .then(() => {
    return User.update({_id: res.locals.user._id}, {$inc: {lifetimePoints: req.body.totalPoints}});
  })
  .then(() => {
    res.redirect(res.locals.home);
  })
  .catch(e => console.log(e));
});

router.delete('/', function(req, res) {
  if (req.xhr) {
    Point.remove({_id: req.body.point})
    .then((doc) => {
      res.status(200).send("Deleted!");
    })
    .catch(e => console.log(e));
  }
});

module.exports = router;
