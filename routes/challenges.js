var express = require('express');
var router = express.Router();
const mongoose = require('./../db/mongoose'); 
const {Challenge} = require('./../models/challenge'); 

/* GET users listing. */
router.get('/new', function(req, res, next) {
  res.render('challenges/new');
});

router.post('/', (req, res, next) => {
	console.log("made it here"); 
	var challenge = new Challenge(req.body)

	challenge.save().then(() => {
		res.render('challenges/show', {challenge})
	}).catch((e) => console.log(e))
})

module.exports = router;