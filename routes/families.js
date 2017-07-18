var express = require('express');

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
    .then(families => res.render('families/index', { families, added: req.query.added ? req.query.added : false }))
    .catch(e => console.log(e));
});

// GET add family form
router.get('/new', (req, res) => res.render('families/new'));

// POST create family
router.post('/', (req, res) => {
  var family = new Family(req.body);
  family.save().then(() => res.redirect(`/families?added=${family.name}`)).catch(e => console.log(e));
});

router.get('/:familyName', (req, res) => {
  var family,
    versingFamily,
    familyParticipations,
    versingFamilyParticipations,
    totalPoints,
    versingTotalPoints,
    addPointsButtonDate,
    dates,
    displayAddPointsButton,
    weekTBD = false;

  dates = req.xhr ? weekDates(req.query) : weekDates();
  // current week is the week that it currently is according to today's date
  res.locals.currentChallenge.currentWeek = getWeekNumber(res.locals.currentChallenge.date.end, getToday());
  // week number is the week that the user has requested data for (based on left and right arrows)
  res.locals.currentChallenge.weekNumber = getWeekNumber(res.locals.currentChallenge.date.end, dates[6]);

  Family.findOne({ name: req.params.familyName })
    .then(familyObj => {
      family = familyObj;
      if (
        (res.locals.currentChallenge.weekNumber == 9 && res.locals.currentChallenge.currentWeek < 9) ||
        (res.locals.currentChallenge.weekNumber == 8 && res.locals.currentChallenge.currentWeek < 8)
      ) {
        weekTBD = true;
      } else {
        return Family.findById(
          res.locals.currentChallenge.schedule['week' + res.locals.currentChallenge.weekNumber][family.name]
            .versingFamily._id
        );
      }
    })
    // then get the versing family
    .then(versingFamilyObj => {
      if (!weekTBD) {
        versingFamily = versingFamilyObj;
      }
      return Participation.setUserParticipationForChallenges(res.locals.user, [res.locals.currentChallenge]);
    })
    // then check to see if the user is participating in the current challenge
    .then(() => {
      return Participation.getParticipationForChallengeByFamily(res.locals.currentChallenge._id, family._id);
    })
    // then get all participants from the family in the current challenge
    .then(familyParticipationsArray => {
      familyParticipations = familyParticipationsArray;
      if (!weekTBD) {
        return Participation.getParticipationForChallengeByFamily(res.locals.currentChallenge._id, versingFamily._id);
      }
    })
    // then get all participants from versing family in the current challenge
    .then(versingFamilyParticipationsArray => {
      if (!weekTBD) {
        versingFamilyParticipations = versingFamilyParticipationsArray;
      }
      // the date that will be set on the add points button which will be used to determine which day the activity occurred
      if (res.locals.currentChallenge.weekNumber == res.locals.currentChallenge.currentWeek) {
        addPointsButtonDate = getToday();
      } else {
        if (req.query.direction == 'previous') {
          addPointsButtonDate = dates[6];
        } else {
          addPointsButtonDate = dates[0];
        }
      }

      if (addPointsButtonDate > getToday()) {
        displayAddPointsButton = false;
      } else if (res.locals.currentChallenge.currentWeek > res.locals.currentChallenge.weekNumber) {
        const now = new Date();
        if (now.getHours() >= 12 && now.getMilliseconds() > 0) {
          displayAddPointsButton = false;
        }
      } else {
        displayAddPointsButton = true;
      }

      var user = req.params.familyName == res.locals.user.family.name ? res.locals.user : undefined;
      return Point.getPointsForParticipationsByDay(familyParticipations, addPointsButtonDate, user);
    })
    // then get a list of all points added for each participating family member in the current challenge
    .then(() => {
      return Point.getTotalPointsForParticipationsByWeek(familyParticipations, dates[0], dates[6]);
    })
    // then get an aggregation of the total points entered by the family for the current week
    .then(totalPointsForWeek => {
      if (weekTBD) {
        family.totalPoints = 'N/A';
      } else {
        family.totalPoints = calculatePoints(totalPointsForWeek, familyParticipations.length);
        return Point.getTotalPointsForParticipationsByWeek(versingFamilyParticipations, dates[0], dates[6]);
      }
    })
    // then get the same aggregation for the versing family
    .then(totalPointsForWeek => {
      // if looking at a future week
      if (weekTBD) {
        versingFamily = { name: 'TBD, check rankings for likelihood of making it to playoffs', totalPoints: 'N/A' };
        family.pointsNeeded = 'N/A';
      } else {
        versingFamily.totalPoints = calculatePoints(totalPointsForWeek, versingFamilyParticipations.length);
        family.pointsNeeded = calculatePointsNeededToWin(
          family.totalPoints,
          familyParticipations.length,
          versingFamily.totalPoints
        );
        familyParticipations = familyParticipations.sort((a, b) => b.totalPoints - a.totalPoints);
      }

      // check whether or not to show next/previous week buttons
      var showPrevious = showPreviousWeek(res.locals.currentChallenge.date.start, dates[0]),
        showNext = showNextWeek(res.locals.currentChallenge.date.start, dates[6]),
        options = {
          currentChallenge: res.locals.currentChallenge,
          dates,
          family,
          versingFamily,
          familyParticipations,
          showPrevious,
          showNext,
          addPointsButtonDate,
          displayAddPointsButton,
          weekTBD
        };

      if (req.xhr) {
        res.render('families/_show_body', options);
      } else {
        res.render('families/show', options);
      }
    })
    .catch(e => console.log(e));
});

router.get('/:familyName/points', (req, res) => {
  let family, familyParticipations, displayAddPointsButton;
  const date = new Date(req.query.date);
  // current week is the week that it currently is according to today's date
  res.locals.currentChallenge.currentWeek = getWeekNumber(res.locals.currentChallenge.date.end, getToday());
  // week number is the week that the user has requested data for (based on left and right arrows)
  res.locals.currentChallenge.weekNumber = getWeekNumber(res.locals.currentChallenge.date.end, date);

  Family.findOne({ name: req.params.familyName })
    .then(family => {
      return Participation.getParticipationForChallengeByFamily(res.locals.currentChallenge._id, family._id);
    })
    .then(familyParticipationsArray => {
      familyParticipations = familyParticipationsArray;

      displayAddPointsButton = date > getToday() ? false : true;
      addPointsButtonDate = date;
      var user = req.params.familyName == res.locals.user.family.name ? res.locals.user : undefined;
      return Point.getPointsForParticipationsByDay(familyParticipations, addPointsButtonDate, user);
    })
    .then(() => {
      res.render('families/_daily_points', { familyParticipations, displayAddPointsButton });
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

// have to get day before since challenge ends on
// Monday at 12:00:00 AM instead of Sunday at 11:59:59 PM
function getWeekNumber(challengeEndDate, sunday) {
  var dayBeforeEndDate = new Date(challengeEndDate.getTime());
  dayBeforeEndDate.setDate(dayBeforeEndDate.getDate() - 1);
  return Math.ceil((63 - Math.abs(dateDiffInDays(dayBeforeEndDate, sunday))) / 7);
}

// a and b are javascript Date objects
function dateDiffInDays(a, b) {
  var _MS_PER_DAY = 1000 * 60 * 60 * 24;
  // Discard the time and time-zone information.
  var utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  var utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

  return Math.floor((utc2 - utc1) / _MS_PER_DAY);
}

function calculatePoints(familyTotalPoints, numOfParticipants) {
  numOfParticipants = numOfParticipants >= 5 ? numOfParticipants : 5;
  return (familyTotalPoints / numOfParticipants).toFixed(2);
}

function calculatePointsNeededToWin(familyTotalPoints, numOfParticipants, versingFamilyTotalPoints) {
  numOfParticipants = numOfParticipants >= 5 ? numOfParticipants : 5;
  var deficientPoints = versingFamilyTotalPoints - familyTotalPoints;
  return deficientPoints <= 0 ? 0 : numOfParticipants * deficientPoints;
}

function getToday() {
  var date = new Date();
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}
