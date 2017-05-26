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
	console.log("made it here"); 
	var user = new User(req.body)
	console.log(user)

	user.save().then((user) => {
		res.redirect('/users/new')
	}).catch((e) => console.log(e))
})

module.exports = router;
