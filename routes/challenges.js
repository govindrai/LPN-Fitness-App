// Modules
var express = require('express'),
	_ = require('lodash');

// Models
var Challenge = require('./../models/challenge'),
	Family = require('./../models/family');

// Middleware
var verifyAuthorization = require('./../middleware/verifyAuthorization'),
  getChallengesCount = require('./../middleware/getChallengesCount');

var router = express.Router();

// GET list all challenges
router.get('/', (req, res) => {
	var currentChallenge, futureChallenges, getPastChallenges;
	Challenge.getCurrentChallenge()
	.then((challenge) => {
		currentChallenge = challenge;
		return Challenge.getFutureChallenges();
	})
	.then((challenges) => {
		futureChallenges = challenges;
		return Challenge.getPastChallenges();
	})
	.then((challenges) => {
		pastChallenges = challenges;
		res.render('challenges/index', {currentChallenge, futureChallenges, pastChallenges});
	})
	.catch(e => console.log(e));
});

// Create Challenge Form
router.get('/new', (req, res) => {
	res.render('challenges/new');
});

// Create Challenge
router.post('/', (req, res) => {
	console.log("I made it here")
	var body = _.pick(req.body, ["name", "date.start", "date.end"]);
	body["date.registration_end"] = body["date.start"];
	var challenge = new Challenge(body);
	console.log(body);
	console.log(challenge);

	challenge.save()
	.then(() => {
		res.redirect('/challenges');
	})
	.catch(e => console.log(e));
})

module.exports = router;