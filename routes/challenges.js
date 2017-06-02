// Modules
var express = require('express'),
	_ = require('lodash');

// Models
var Challenge = require('./../models/challenge'),
	Family = require('./../models/family'),
	Participation = require('./../models/participation');

var router = express.Router();



// GET list all challenges
router.get('/', (req, res) => {
	if (res.locals.loggedIn) {
		var currentChallenges, futureChallenges, pastChallenges;

		Challenge.getCurrentChallenge()
		.then((challenges) => {
			currentChallenges = challenges
			return Participation.getParticipation(res.locals.user, currentChallenges);
		})
		.then(() => {
			return Challenge.getFutureChallenges();
		})
		.then((challenges) => {
			futureChallenges = challenges;
			return Participation.getParticipation(res.locals.user, futureChallenges);
		})
		.then(() => {
			return Challenge.getPastChallenges();
		})
		.then((challenges) => {
			pastChallenges = challenges;
			return Participation.getParticipation(res.locals.user, pastChallenges);
		})
		.then(() => {
			res.render('challenges/index', {currentChallenges, futureChallenges, pastChallenges});
		})
		.catch(e => console.log(e));
	} else {
		res.render('sessions/unauthorized');
	}
});

// Create Challenge Form
router.get('/new', (req, res) => {
	res.render('challenges/new');
});

// Create Challenge
router.post('/', (req, res) => {
	var body = _.pick(req.body, ["name", "date.start", "date.end"]);
	var challenge = new Challenge(body);
	challenge.save()
	.then(() => {
		res.redirect('/challenges');
	})
	.catch(e => console.log(e));
})

module.exports = router;