// Modules
var express = require('express'),
  _ = require('lodash');

// Models
var Activity = require('./../models/activity'),
  Point = require('./../models/point'),
  Challenge = require('./../models/challenge'),
  Participation = require('./../models/participation')
  Unit = require('./../models/unit');


var router = express.Router();

// function checkParticipationInCurrentChallenge(req, res, next) {
//   Challenge.getCurrentChallenge()
//   .then(currentChallenge => {
//     console.log(res.locals.user._id);
//     console.log(currentChallenge._id);
//     return Participation.findOne({user: res.locals.user._id, challenge: currentChallenge._id})
//   })
//   .then((participation) => {
//     console.log(participation);
//     res.locals.participationId = participation._id;
//     next();
//   })
//   .catch(e => {
//     console.log("Error within checkParticipationInCurrentChallenge", e);
//     res.render('sessions/unauthorized', {message: "You are not currently signed up for the current challenge"});
//   })
// }

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
  console.log(req.body)
  Challenge.getCurrentChallenge((challenge) => {
    return challenge
  })
  .then((challenge) => {
    var participation = new Participation({
    user: res.locals.user._id,
    challenge: challenge
  });
  participation.save()
  .then((participation) => {
    var point = new Point({
      participation: participation,
      activity: req.body.activity,
      numOfUnits: req.body.numOfUnits,
      calculatedPoints: null 
    });
  point.save()
  .then(() => {
    res.redirect('/');
  }).catch((e) => console.log(e))
  })
  })
});

module.exports = router;
