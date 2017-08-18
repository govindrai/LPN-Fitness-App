const express = require("express");

// Models
const Family = require("./../models/family"),
  Challenge = require("./../models/challenge"),
  Participation = require("./../models/participation"),
  Point = require("./../models/point"),
  User = require("./../models/user");

const router = express.Router();

router.get("/:familyName", (req, res) => {
  let family,
    versingFamily,
    familyParticipations,
    versingFamilyParticipations,
    totalPoints,
    versingTotalPoints,
    addPointsButtonDate,
    dates,
    displayAddPointsButton,
    currentWeek,
    requestedWeek,
    currentChallenge = res.locals.currentChallenge,
    today = getToday();

  console.log("currentChallenge", currentChallenge);
  dates = calculateDates(req.query.weekInfo);
  currentWeek = calculateWeekNumber(currentChallenge.date.end, today);
  requestedWeek = calculateWeekNumber(currentChallenge.date.end, dates[6]);

  // Find the family who's page has been requested
  Family.findOne({ name: req.params.familyName })
    .then(familyObj => {
      family = familyObj;
      versingFamily = determineVersingFamily(
        requestedWeek,
        currentWeek,
        currentChallenge,
        family.name
      );
      return Participation.setUserParticipationForChallenges(res.locals.user, [
        currentChallenge
      ]);
    })
    // then check to see if the user is participating in the current challenge
    .then(() => {
      return Participation.getParticipationForChallengeByFamily(
        currentChallenge._id,
        family._id
      );
    })
    // then get all participants from the family in the current challenge
    .then(familyParticipationsArray => {
      familyParticipations = familyParticipationsArray;
      if (versingFamily) {
        return Participation.getParticipationForChallengeByFamily(
          currentChallenge._id,
          versingFamily._id
        );
      }
    })
    // then get all participants from versing family in the current challenge
    .then(versingFamilyParticipationsArray => {
      if (versingFamily) {
        versingFamilyParticipations = versingFamilyParticipationsArray;
      }
      // the date that will be set on the add points button which will be used to determine which day the activity occurred
      if (requestedWeek == currentWeek) {
        addPointsButtonDate = getToday();
      } else {
        if (req.query.direction == "previous") {
          addPointsButtonDate = dates[6];
        } else {
          addPointsButtonDate = dates[0];
        }
      }

      if (addPointsButtonDate > getToday()) {
        displayAddPointsButton = false;
      } else if (currentWeek > requestedWeek) {
        const now = new Date();
        if (now.getHours() >= 12 && now.getMilliseconds() > 0) {
          displayAddPointsButton = false;
        }
      } else {
        displayAddPointsButton = true;
      }

      var user =
        req.params.familyName == res.locals.user.family.name
          ? res.locals.user
          : undefined;
      return Point.getPointsForParticipationsByDay(
        familyParticipations,
        addPointsButtonDate,
        user
      );
    })
    // then get a list of all points added for each participating family member in the current challenge
    .then(() => {
      return Point.getTotalPointsForParticipationsByWeek(
        familyParticipations,
        dates[0],
        dates[6]
      );
    })
    // then get an aggregation of the total points entered by the family for the current week
    .then(totalPointsForWeek => {
      if (!versingFamily) {
        family.totalPoints = "N/A";
      } else {
        family.totalPoints = calculatePoints(
          totalPointsForWeek,
          familyParticipations.length
        );
        return Point.getTotalPointsForParticipationsByWeek(
          versingFamilyParticipations,
          dates[0],
          dates[6]
        );
      }
    })
    // then get the same aggregation for the versing family
    .then(totalPointsForWeek => {
      // if looking at a future week
      if (!versingFamily) {
        versingFamily = {
          name: "TBD, check rankings for likelihood of making it to playoffs",
          totalPoints: "N/A"
        };
        family.pointsNeeded = { status: "N/A", message: "N/A" };
      } else {
        versingFamily.totalPoints = calculatePoints(
          totalPointsForWeek,
          versingFamilyParticipations.length
        );
        family.pointsNeeded = calculatePointsNeededToWin(
          family.totalPoints,
          familyParticipations.length,
          versingFamily.totalPoints
        );
        familyParticipations = familyParticipations.sort(
          (a, b) => b.totalPoints - a.totalPoints
        );
      }

      // check whether or not to show next/previous week buttons
      var showPrevious = showPreviousWeek(
          currentChallenge.date.start,
          dates[0]
        ),
        showNext = showNextWeek(currentChallenge.date.start, dates[6]);

      let nextMonday = new Date(dates[6]);
      nextMonday.setDate(nextMonday.getDate() + 1);
      const timeRemaining = getTimeRemaining(nextMonday);

      const options = {
        // currentChallenge: currentChallenge,
        timeRemaining,
        dates,
        family,
        versingFamily,
        familyParticipations,
        showPrevious,
        showNext,
        addPointsButtonDate,
        displayAddPointsButton
      };

      if (req.xhr) {
        res.render("families/_show_body", options);
      } else {
        res.render("families/show", options);
      }
    })
    .catch(e => console.log(e));
});

router.get("/:familyName/points", (req, res) => {
  let family, familyParticipations, displayAddPointsButton;
  const date = new Date(req.query.date);
  // current week is the week that it currently is according to today's date
  currentWeek = calculateWeekNumber(currentChallenge.date.end, getToday());
  // week number is the week that the user has requested data for (based on left and right arrows)
  requestedWeek = calculateWeekNumber(currentChallenge.date.end, date);

  Family.findOne({ name: req.params.familyName })
    .then(family => {
      return Participation.getParticipationForChallengeByFamily(
        currentChallenge._id,
        family._id
      );
    })
    .then(familyParticipationsArray => {
      familyParticipations = familyParticipationsArray;

      displayAddPointsButton = date > getToday() ? false : true;
      addPointsButtonDate = date;
      var user =
        req.params.familyName == res.locals.user.family.name
          ? res.locals.user
          : undefined;
      return Point.getPointsForParticipationsByDay(
        familyParticipations,
        addPointsButtonDate,
        user
      );
    })
    .then(() => {
      res.render("families/_daily_points", {
        familyParticipations,
        displayAddPointsButton
      });
    })
    .catch(e => console.log(e));
});

// GET all families
router.get("/", (req, res) => {
  Family.find()
    .then(families =>
      res.render("families/index", {
        families,
        added: req.query.added
      })
    )
    .catch(e => console.log(e));
});

// GET add family form
router.get("/new", (req, res) => res.render("families/new"));

// POST create family
router.post("/", (req, res) => {
  new Family(req.body)
    .save()
    .then(() => res.redirect(`/families?added=${req.body.name}`))
    .catch(e => console.log(e));
});

module.exports = router;

// PRIVATE FUNCTIONS

// calculates all the dates for a given week
function calculateDates(weekInfo) {
  var startDate;
  if (weekInfo) {
    if (weekInfo.direction == "previous") {
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

// if requesting a playoff week before playoffs, teams are not determined otherwise set the versing family
function determineVersingFamily(
  requestedWeek,
  currentWeek,
  currentChallenge,
  familyName
) {
  if (
    (requestedWeek === 9 && currentWeek < 9) ||
    (requestedWeek === 8 && currentWeek < 8)
  ) {
    return false;
  } else {
    return currentChallenge.schedule["week" + requestedWeek][familyName]
      .versingFamily;
  }
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
function calculateWeekNumber(challengeEndDate, sunday) {
  var dayBeforeEndDate = new Date(challengeEndDate.getTime());
  dayBeforeEndDate.setDate(dayBeforeEndDate.getDate() - 1);
  return Math.ceil(
    (63 - Math.abs(dateDiffInDays(dayBeforeEndDate, sunday))) / 7
  );
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

function calculatePointsNeededToWin(
  familyTotalPoints,
  numOfParticipants,
  versingFamilyTotalPoints
) {
  numOfParticipants = numOfParticipants >= 5 ? numOfParticipants : 5;
  var deficientPoints = versingFamilyTotalPoints - familyTotalPoints;
  return deficientPoints <= 0
    ? { status: "winning", message: `winning by x # of points` }
    : {
        status: "losing",
        message: `need ${numOfParticipants *
          deficientPoints} total points to tie`
      };
}

function getToday() {
  var date = new Date();
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function getTimeRemaining(endOfWeek) {
  const total = Date.parse(endOfWeek) - Date.parse(new Date()),
    days = Math.floor(total / (1000 * 60 * 60 * 24)),
    hours = Math.floor(total / (1000 * 60 * 60) % 24),
    minutes = Math.floor(total / 1000 / 60 % 60);
  return `${days} DAYS, ${hours} HOURS, ${minutes} MINUTES`;
}
