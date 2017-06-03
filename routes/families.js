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
    var currentChallenges, futureChallenges
    Family.findOne({name: req.params["family_name"]})
    .then((family) => {
    Challenge.getCurrentChallenge()
    .then((challenges) => {
      currentChallenges = challenges
      return Participation.getParticipation(res.locals.user, currentChallenges);
    })
    .then(() => {
      res.render('families/show', {family, currentChallenges});
    })
    .catch(e => console.log(e));
  });
});

module.exports = router;