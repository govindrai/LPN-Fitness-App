// Modules
var express = require('express'),
	path = require('path'),
	pug = require('pug');

// Models
var Family = require('./../models/family'),
	Challenge = require('./../models/challenge'),
	Participation = require('./../models/participation'),
	Point = require('./../models/point'),
	User = require('./../models/user');

var router = express.Router();

/* View all families */
router.get('/', function(req, res) {
	Family.find({}).then((families) => {
		res.render('families/index', {families});
	});
});

/* Create a new family */
router.get('/new', function(req, res) {
	res.render('families/new');
});

router.post('/', (req, res, next) => {
	var family = new Family(req.body);

	family.save().then(() => {
		res.params({added: true});
		res.redirect('/families');
	}).catch(e => console.log(e));
});

router.post('/calendar', (req, res) => {
	if (req.xhr) {
		res.send(pug.renderFile(path.join(__dirname, '../views/families/_calendar_dates.pug'), {dates: weekDates(req.body)}));
	}
});



// router.get('/calendar', (req, res) => {
//   if (req.xhr) {
//     dates = [5,6,7,8,9,10,11];
//     res.send(pug.renderFile(process.env.PWD + '/views/families/_calendar.pug', {dates}));
//   }
// });

// gets point objs for a certain date
router.post('/points', (req, res) => {
	if (req.xhr) {
		Participation.findOne({user: res.locals.user._id, challenge: res.locals.currentChallenge._id})
		.then(participation => {
			return Point.getPointsByDay(participation, req.body.date);
		})
		.then((points) => {
			res.send(pug.renderFile(process.env.PWD + '/views/families/_activities.pug', {points, date: req.body.date}));
		});
	}
});

// Family Show Page/Authorized User Landing Page
router.get('/:familyName', (req, res) => {
	var family, currentChallenge, users, participation, familyParticipations;

  // First get the family who's page was requested
	Family.findOne({name: req.params.familyName})
	.then(familyObj => {
		family = familyObj;
		return Challenge.getCurrentChallenge();
	})
  // then get information on the currentChallenge
	.then(challenge => {
		currentChallenge = challenge;
		return Participation.setUserParticipationForChallenges(res.locals.user, [currentChallenge]);
	})
  // then check if the user is participating in the current challenge
	.then(() => {
		return Participation.getParticipationForChallengeByFamily(currentChallenge._id, family._id);
	})
	.then(familyParticipationsArray => {
		familyParticipations = familyParticipationsArray;
		return Point.getTotalPointsForParticipations(familyParticipations);
	})
	.then(() => {
		return Point.getTotalPointsForParticipatingFamily(familyParticipations);
	})
	.then((totalPoints) => {
		res.render('families/show', {dates: weekDates(), family, totalPoints, familyParticipations, currentChallenge});
	})
	.catch(e => console.log(e));
});

module.exports = router;

// PRIVATE FUNCTIONS

// calculates all the dates for a given week
function weekDates(weekInfo) {
  var startDate;
  if (typeof weekInfo == 'object') {
    startDate = new Date(weekInfo.date);
    if (weekInfo.direction == 'previous') {
      startDate.setDate(startDate.getDate() - 7);
    } else {
      startDate.setDate(startDate.getDate() + 1);
    }
  } else {
    var today = new Date();
    today = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());
    var day = today.getDay();
    startDate = new Date(today.setDate(today.getDate() - (day - 1)));
  }
  var dates = [new Date(startDate)];
    for (var i = 0; i < 6; i++) {
      dates.push(new Date(startDate.setDate(startDate.getDate() + 1)));
    }
  return dates;
}