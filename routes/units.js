var express = require('express');
var router = express.Router();
const mongoose = require('./../db/mongoose'); 
const Unit = require('./../models/unit'); 

/* GET users listing. */
router.get('/new', function(req, res, next) {
	Unit.find({}).then((units) => {
		res.render('units/new', {units});
	})
});

router.post('/', (req, res, next) => {
	var unit = new Unit(req.body)

	unit.save().then(() => {
		res.redirect('/units/new')
	}).catch((e) => console.log(e))
})

module.exports = router;