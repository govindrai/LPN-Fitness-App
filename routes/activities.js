var express = require('express');
var router = express.Router();
const mongoose = require('./../db/mongoose'); 
const {Activity} = require('./../models/activity'); 
const {Unit} = require('./../models/unit');

/* GET users listing. */
router.get('/new', function(req, res, next) {
	Unit.find({}).then((units) => {
		Activity.find({}).populate('unit_id').then((activities) => {
			console.log(activities);
			res.render('activities/new', {units, activities});
		})
	}); 
});

router.post('/', (req, res, next) => {
	var activity = new Activity(req.body)
	activity.save().then((activity) => {
		res.redirect('/activities/new');
	}).catch((e) => console.log(e))
})

module.exports = router;