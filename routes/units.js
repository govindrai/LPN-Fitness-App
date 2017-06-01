// Modules
var express = require('express');

// Models
var Unit = require('./../models/unit');

var router = express.Router();

/* GET users listing. */
router.get('/new', function(req, res, next) {
	Unit.find({})
  .then(units => {
		res.render('units/new', {units});
	})
  .catch(e => console.log(e));
});

router.post('/', (req, res, next) => {
	var unit = new Unit(req.body)

	unit.save().then(() => {
		res.redirect('/units/new')
	}).catch((e) => console.log(e))
})

module.exports = router;