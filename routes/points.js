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
    return Participation.findOne({user: res.locals.user._id, challenge: currentChallenge._id})
  })
  .then((participation) => {
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
      res.render('points/new', {points, activities});
    });
  })
  .catch(e => console.log(e));
});



router.post('/', (req, res) => {
  var body = _.pick(req.body, ['participation', 'activity', 'date', 'numOfUnits', 'calculatedPoints']);
  body.user = res.locals.user._id;
  var point = new Point(body);
  point.save().then((point) => {
      return User.update({_id: body.user}, {$inc: {lifetimePoints: body.calculatedPoints}});
  })
  .then(() => {
    res.redirect(res.locals.home);
  })
  .catch((e) => console.log(e))
});

router.get('/:_id', function(req, res) {
    console.log("Made it here");
    Point.findOneAndUpdate({_id: req.params._id}, {$set: req.body}).then((point) => {
    res.render('points/edit', {point}); 
  }).catch(e => console.log(e)); 
});

router.put('/:_id', function(req, res) {
    console.log("Made it here");
    Point.findOneAndUpdate({_id: req.params._id}, {$set: req.body}).then((point) => {
    res.render('points/edit', {point}); 
  }).catch(e => console.log(e)); 
});

router.delete('/:_id', function(req, res) {
  console.log("DELETE");
  Point.remove({_id: req.params._id})
  .then((doc) => {
    console.log('Success')
  }).catch(e => console.log(e));
});

module.exports = router;
