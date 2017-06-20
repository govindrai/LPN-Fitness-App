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

// GET all families
router.get('/', (req, res) => {
	Family.find()
  .then(families => res.render('families/index', {families, added: req.query.added ? req.query.added : false}))
  .catch(e => console.log(e));
});

// GET add family form
router.get('/new', (req, res) => res.render('families/new'));

// POST create family
router.post('/', (req, res, next) => {
	var family = new Family(req.body);

	family.save()
  .then(() => {
		res.redirect(`/families?added=${family.name}`);
	})
  .catch(e => console.log(e));
});

// POST get new calendar dates
router.post('/calendar', (req, res) => {
  var dates = weekDates(req.body);
  var showPrevious = showPreviousWeek(res.locals.currentChallenge.date.start, dates[0]),
    showNext = showNextWeek(res.locals.currentChallenge.date.end, dates[6]);
	res.send({
    datesHTML: pug.renderFile(path.join(__dirname, '../views/families/_calendar_dates.pug'), {dates: weekDates(req.body)}),
    showPrevious,
    showNext
  });
});

// Family Show Page/Authorized User Landing Page
router.get('/:familyName', (req, res) => {
	var family, users, participation, familyParticipations, totalPoints;
	var dates = weekDates();

  // First get the family who's page was requested
	Family.findOne({name: req.params.familyName})
	.then(familyObj => {
		family = familyObj;
		return Participation.setUserParticipationForChallenges(res.locals.user, [res.locals.currentChallenge]);
	})
  // then check if the user is participating in the current challenge
	.then(() => {
		return Participation.getParticipationForChallengeByFamily(res.locals.currentChallenge._id, family._id);
	})
	.then(familyParticipationsArray => {
		familyParticipations = familyParticipationsArray;
		return Point.getTotalPointsForParticipationsByWeek(familyParticipations, dates[0], dates[6]);
	})
	.then(totalPoints => {
		familyParticipations = familyParticipations.sort((a,b) => b.totalPoints - a.totalPoints);
    var showPrevious = showPreviousWeek(res.locals.currentChallenge.date.start, dates[0]),
      showNext = showNextWeek(res.locals.currentChallenge.date.start, dates[6]);

		res.render('families/show', {dates, family, totalPoints, familyParticipations, currentChallenge: res.locals.currentChallenge, showPrevious, showNext});
	})
	.catch(e => console.log(e));
});

module.exports = router;

// PRIVATE FUNCTIONS

// calculates all the dates for a given week
function weekDates(weekInfo) {
  var startDate;
  if (typeof weekInfo == 'object') {
    if (weekInfo.direction == 'previous') {
      startDate = new Date(weekInfo.monday);
      startDate.setDate(startDate.getDate() - 7);
    } else {
      startDate = new Date(weekInfo.sunday);
      startDate.setDate(startDate.getDate() + 1);
    }
  } else {
    var today = new Date();
    today = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    var day = today.getDay();
    startDate = new Date(today.setDate(today.getDate() - (day - 1)));
  }
  var dates = [new Date(startDate)];
    for (var i = 0; i < 6; i++) {
      dates.push(new Date(startDate.setDate(startDate.getDate() + 1)));
    }
  return dates;
}


function showPreviousWeek(challengeStartDate, monday) {
  return challengeStartDate.toString() != monday.toString();
}

function showNextWeek(challengeEndDate, sunday) {
  var dateAfterSunday = new Date(sunday.getTime());
  dateAfterSunday.setDate(sunday.getDate() + 1);
  return challengeEndDate.toString() != dateAfterSunday.toString();
}

function getWeekNumber(challengeEndDate, sunday) {

}