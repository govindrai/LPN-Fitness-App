// Modules
var express = require('express');

// Models
var User = require('./../models/user'),
	Family = require('./../models/family');

var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
	Family.find({}).then((families) => {
		User.find({}).populate('family').then((users) => {
			res.render('users/index', {families, users});
		})
	});
})

router.post('/', (req, res, next) => {
	var user = new User(req.body)
	user.save().then((user) => {
		user.generateAuthToken().then((token) => {
				res.redirect('/families');
		});
	}).catch(e => console.log(err));
})

// initialize new user, if save successful,
// generate auth token and take to home page
router.post('/', (req, res, next) => {
	var user = new User(req.body)

	user.save().then((user) => {
		user.generateAuthToken().then((token) => {
				res.redirect('/families/');
		});
	}).catch(e => console.log(err));
})

module.exports = router;
