var express = require('express');
var router = express.Router();
const mongoose = require('./../db/mongoose');
const {Family} = require('./../models/family');
const authenticate = require('./../middleware/authenticate')

/* View all families */
router.get('/', function(req, res, next) {
  Family.find({}).then((families) => {
    res.render('families/index', {families});
  })
});

/* Create a new family */
router.get('/new', function(req, res, next) {
  res.render('families/new');
});

router.post('/', authenticate,  (req, res, next) => {
	console.log("made it here");
	var family = new Family(req.body)

	family.save().then(() => {
    res.params({added: true});
		res.redirect('/families');
	}).catch((e) => console.log(e))
})

router.get('/:family_name', (req, res) => {
  User.find
})

module.exports = router;