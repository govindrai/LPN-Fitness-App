var express = require('express'),
	pug = require('pug');

var Activity = require('./../models/activity'),
	Unit = require('./../models/unit');

var router = express.Router();

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

// GET all activities
router.get('/new', (req, res) => {
	Unit.find({}).then((units) => {
		Activity.find({}).populate('unit').then((activities) => {
			console.log(activities);
			res.render('activities/new', {units, activities});
		})
	});
});

// TODO Need middleware to check whether user registered for a current challenge and then set currentChallenge to that challenge

// GET activity info
router.get('/:activityName', (req, res) => {
	if (req.xhr) {
		Activity.findOne({name: req.params.activityName}).populate('unit')
		.then(activity => {
			var activity = activity
			res.send(pug.renderFile(process.env.PWD + '/views/points/_form.pug', {activity, user: res.locals.user}));
		})
		.catch(e =>  {
			console.log(e);
			res.status(404).send("No Activity with name " + req.params.activityName);
		})
	} else {
		res.status(400).send("Not an XHR request");
	}
});

router.post('/', (req, res, next) => {
	var activity = new Activity(req.body)
	activity.save().then((activity) => {
		res.redirect('/activities/new');
	}).catch((e) => console.log(e))
})

module.exports = router;
