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
	var currentChallenge, futureChallenges, pastChallenges;
	if (res.locals.loggedIn) {
		Challenge.getCurrentChallenge()
		.then((challenge) => {
			currentChallenge = challenge;
			return Participation.setUserParticipationForChallenges(res.locals.user, [currentChallenge]);
		})
		.then(() => {
			return Challenge.getFutureChallenges();
		})
		.then((challenges) => {
			futureChallenges = challenges;
			return Participation.setUserParticipationForChallenges(res.locals.user, futureChallenges);
		})
		.then(() => {
			return Challenge.getPastChallenges();
		})
		.then((challenges) => {
			pastChallenges = challenges;
			return Participation.setUserParticipationForChallenges(res.locals.user, pastChallenges);
		})
		.then(() => {
			res.render('challenges/index', {currentChallenge, futureChallenges, pastChallenges});
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
});

router.get('/schedule', (req, res) => {
	var challenge;
	Challenge.findById(res.locals.currentChallenge._id)
	.then(challengeObj => {
		challenge = challengeObj; 
		return Family.find({});
	})
	.then(families => {
		console.log(challenge.schedule);
		res.render('challenges/schedule', {challenge, families});
	})
	.catch(e => console.log(e));
});

module.exports = router;