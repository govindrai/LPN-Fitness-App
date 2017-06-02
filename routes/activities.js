var express = require('express');

var mongoose = require('./../db/mongoose'),
	Activity = require('./../models/activity'),
	Unit = require('./../models/unit');

var router = express.Router()

router.get('/', (req, res) => {
	if (req.xhr) {
		Activity.find({})
		.then(activities => {
      var activitiesArray = [];
      activities.forEach((activity) => {
        activitiesArray.push(activity.name);
      });
      res.send(activitiesArray);
		})
		.catch(e => console.log(e));
	} else {
		Unit.find({}).then((units) => {
		Activity.find({}).populate('unit').then((activities) => {
			res.render('activities/index', {activities});
		})
	});
	}
})

/* GET users listing. */
router.get('/new', (req, res) => {
	Unit.find({}).then((units) => {
		Activity.find({}).populate('unit').then((activities) => {
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