// Modules
var express = require('express');

// Models
var Family = require('./../models/family'),
  Challenge = require('./../models/challenge'),
  Participation = require('./../models/participation'),
  User = require('./../models/user');

var router = express.Router();

/* View all families */
router.get('/', function(req, res, next) {
  Family.find({}).then((families) => {
    res.render('families/index', {families});
  });
});

/* Create a new family */
router.get('/new', function(req, res, next) {
  res.render('families/new');
});

router.post('/', (req, res, next) => {
	var family = new Family(req.body);

	family.save().then(() => {
    res.params({added: true});
		res.redirect('/families');
	}).catch((e) => console.log(e))
});

// Family Show Page/ Authorized User Landing Page
router.get('/:family_name', (req, res) => {
<<<<<<< HEAD
    var currentChallenge;
    Family.findOne({name: req.params["family_name"]})
    .then((family) => {
      Challenge.getCurrentChallenge()
    .then((challenge) => {
      currentChallenge = challenge;
      return Participation.getParticipation(res.locals.user, [currentChallenge]);
=======
    var family, currentChallenge;
    Family.findOne({name: req.params["family_name"]})
    .then((familyObj) => {
      family = familyObj;
      return Challenge.getCurrentChallenge();
    })
    .then((challenge) => {
      currentChallenge = challenge;
      return Participation.getParticipation(res.locals.user, [currentChallenge]);
    })
    .then(() => {
      return Participation.getParticipantsByFamily(currentChallenge._id, family._id);
>>>>>>> 146858f52f3c755adb16a753dbb519058981b2b5
    })
    .then(() => {
      res.render('families/show', {family, currentChallenge});
    })
    .catch(e => console.log(e));
});

module.exports = router;