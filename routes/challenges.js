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

router.use(verifyAuthorization);
router.use(getChallengesCount);

// Get all challenges
router.get('/', (req, res) => {
	Challenge.find({}).populate('winner').then((challenges) => {
		res.render('challenges/index', {challenges});
	})
	.catch(e => console.log(e));
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