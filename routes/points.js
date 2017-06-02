// Modules
var express = require('express');

// Models
var Activity = require('./../models/activity'),
  Point = require('./../models/point'),
  Unit = require('./../models/unit'),
  Challenge = require('./../models/challenge'),
  Participation = require('./../models/participation');

var router = express.Router();

function checkParticipationInCurrentChallenge(req, res, next) {
  Challenge.getCurrentChallenge()
  .then(currentChallenge => {
    console.log(res.locals.user._id);
    console.log(currentChallenge._id);
    return Participation.findOne({user: res.locals.user._id, challenge: currentChallenge._id})
  })
  .then((participation) => {
    console.log(participation);
    res.locals.participationId = participation._id;
    next();
  })
  .catch(e => {
    console.log("Error within checkParticipationInCurrentChallenge", e);
    res.render('sessions/unauthorized', {message: "You are not currently signed up for the current challenge"});
  })
}

router.get('/new', checkParticipationInCurrentChallenge, (req, res) => {
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
