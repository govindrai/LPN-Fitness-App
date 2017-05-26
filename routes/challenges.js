var express = require('express');
var router = express.Router();
const mongoose = require('./../db/mongoose'); 
const {Challenge} = require('./../models/challenge'); 
const {Family} = require('./../models/family');

/* GET users listing. */
router.get('/', function(req, res, next) {
	Family.find({}).then((families) => {
		Challenge.find({}).populate('winner').then((challenges) => {
			res.render('challenges/index', {families, challenges});
		})
	})
});

router.get('/new', function(req, res, next) {
	res.render('challenges/new');
});

router.post('/', (req, res, next) => {
	console.log("made it here"); 
	var challenge = new Challenge(req.body)
	console.log(challenge)
	console.log(challenge.date.end)

	challenge.save().then((challenge) => {
		res.redirect('/challenges/new')
	}).catch((e) => console.log(e))
})

module.exports = router;