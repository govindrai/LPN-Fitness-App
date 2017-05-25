var express = require('express');
var router = express.Router();
const mongoose = require('./../db/mongoose'); 
const {Family} = require('./../models/family'); 

/* GET users listing. */
router.get('/new', function(req, res, next) {
  res.render('families/new');
});

router.post('/', (req, res, next) => {
	console.log("made it here"); 
	var family = new Family(req.body)

	family.save().then(() => {
		res.render('families/show', {family})
	}).catch((e) => console.log(e))
})

module.exports = router;