var express = require('express');
var router = express.Router();
const mongoose = require('./../db/mongoose');
const {User} = require('./../models/user');
const {Family} = require('./../models/family');

/* GET users listing. */

router.get('/', function(req, res, next) {
	Family.find({}).then((families) => {
		User.find({}).populate('family').then((users) => {
			res.render('users/index', {families, users});
		})
	});
})

router.get('/new', function(req, res, next) {
Family.find({}).then((families) => {
		User.find({}).populate('family').then((users) => {
			res.render('users/new', {families});
		})
	});
});

router.post('/', (req, res, next) => {
	var user = new User(req.body)
	user.save().then((user) => {
		user.generateAuthToken().then((token) => {
			// user.tokens.push({access: "auth", token});
			// user.save().then(() => {
				res.cookie('x-auth', token);
				// res.header('x-auth', token);
				res.redirect('/families');
			// });
		});
	}).catch(e => console.log(err));
})

// initialize new user, if save successful,
// generate auth token and take to home page
router.post('/', (req, res, next) => {
	var user = new User(req.body)

	user.save().then((user) => {
		user.generateAuthToken().then((token) => {
				res.cookie('x-auth', token);
				res.redirect('/families/');
		});
	}).catch(e => console.log(err));
})

module.exports = router;
