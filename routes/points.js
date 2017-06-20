// Modules
var express = require('express'),
  pug = require('pug'),
  path = require('path'),
  _ = require('lodash');

// Models
var Activity = require('./../models/activity'),
  Point = require('./../models/point'),
  Unit = require('./../models/unit'),
  Challenge = require('./../models/challenge'),
  Participation = require('./../models/participation'),
  User = require('./../models/user');

var router = express.Router();

router.get('/', (req, res) => {
  Participation.findOne({user: res.locals.user._id, challenge: res.locals.currentChallenge._id})
  .then(participation => {
    console.log("PARTICIPATION", participation);
    return Point.getPointsByDay(participation, req.query.date);
  })
  .then(points => {
    console.log("AND NOW THIS WAS HIT");
    res.send(pug.renderFile(path.join(__dirname + '/../views/points/_user_points_for_day.pug'), {points, date: req.query.date}));
  })
  .catch(e => console.log(e));
});

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

// checkParticipationInCurrentChallenge needs to occur to display calendar

router.get('/new', checkParticipationInCurrentChallenge, (req, res) => {
  if (req.xhr) {
    Activity.find({}).then(activities => {
      res.render('points/new', {activities, date: req.query.date});
    })
    .catch(e => console.log(e));
  }
});

router.post('/', (req, res) => {
  var points = [];
  if (typeof req.body.activity == "object") {
    var countOfActivities = req.body.activity.length;


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
  } else {
    var body = _.pick(req.body, ['activity', 'participation', 'numOfUnits', 'calculatedPoints', 'date']);
    body.user = res.locals.user._id;
    points.push(body);
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
  Point.remove({_id: req.body.point})
  .then(doc => {
    res.status(200).send("Deleted!");
  })
  .catch(e => console.log(e));
});

module.exports = router;
