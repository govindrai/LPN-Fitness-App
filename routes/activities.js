var express = require('express');

var mongoose = require('./../db/mongoose'),
	Activity = require('./../models/activity'),
	Unit = require('./../models/unit');

var router = express.Router(),
	verifyAuthorization = require('./../middleware/verifyAuthorization');

/* GET users listing. */
router.get('/new', verifyAuthorization, (req, res) => {
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