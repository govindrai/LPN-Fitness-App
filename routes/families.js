const express = require("express");

// Models
const Family = require("./../models/family"),
  Challenge = require("./../models/challenge"),
  Participation = require("./../models/participation"),
  Point = require("./../models/point"),
  User = require("./../models/user");

const router = express.Router();

router.get("/:familyName", (req, res) => {
  let user = res.locals.user,
    family,
    versingFamily,
    familyParticipants,
    versingFamilyParticipants,
    totalPoints,
    versingTotalPoints,
    defaultShowDate,
    addPointsButtonDate,
    dates,
    displayAddPointsButton,
    currentWeek,
    requestedWeek,
    isFutureWeek,
    currentChallenge = res.locals.currentChallenge,
    today = getToday();

  dates = calculateDates(req.query.weekInfo);
  currentWeek = calculateWeekNumber(currentChallenge.date.end, today);
  requestedWeek = calculateWeekNumber(currentChallenge.date.end, dates[6]);
  isfutureWeek = requestedWeek > currentWeek;

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
      // then get all challenge participants in family
      return Participation.getChallengeParticipantsByFamily(
        currentChallenge._id,
        family._id
      );
    })
    .then(familyParticipantsArray => {
      familyParticipants = familyParticipantsArray;
      // check if user is participating in the challenge
      user.isParticipating = checkUserParticipation(familyParticipants, user);
      // then, if versingFamily, get all challenge participants in versing family
      if (versingFamily) {
        return Participation.getChallengeParticipantsByFamily(
          currentChallenge._id,
          versingFamily._id
        );
      }
    })
    .then(versingFamilyParticipantsArray => {
      if (versingFamily) {
        versingFamilyParticipants = versingFamilyParticipantsArray;
      }

      // determine selected calendar date when user accesses family page
      // or when user chooses to switch weeks using arrow buttons
      defaultShowDate = calculateDefaultShowDate(
        requestedWeek,
        currentWeek,
        today,
        req.query.direction,
        dates
      );

      if (!isFutureWeek) {
        // determine if the points button should show and if so the date
        // it should hold for when user's choose to submit points
        addPointsButtonDate = calculateAddPointsButtonDate(
          currentWeek,
          requestedWeek,
          today,
          defaultShowDate
        );
      }
      // then total the points for each challenge participant
      // if the user requesting the page is part of the family
      // then move that user to the top
      // if it is a future week, points will not get calculated
      // but ordering may change if user is part of family
      return Point.calculateParticipantPointsByDay(
        familyParticipants,
        defaultShowDate,
        family.name === user.family.name ? user : undefined,
        isfutureWeek
      );
    })
    .then(() => {
      // then, calculate points for the family for the entire week
      // if it is a future week, points will not get calculated
      return Point.calculatePointsForWeek(
        familyParticipants,
        dates[0],
        dates[6],
        isFutureWeek
      );
    })
    .then(totalFamilyPointsForWeek => {
      // then calculate the team score based on the total points
      family.teamScore = !versingFamily
        ? "N/A"
        : calculateTeamScore(
            family,
            versingFamily,
            totalPoints,
            numOfParticipants
          );
    })
    .then(() => {
      // then, calculate points for the versingFamily for the entire week
      // if it is a future week, points will not get calculated
      if (versingFamily) {
        return Point.calculatePointsForWeek(
          versingFamilyParticipants,
          dates[0],
          dates[6],
          isFutureWeek
        );
      }
    })
    // then calculate the versing team score based on the total points
    .then(totalVersingFamilyPointsForWeek => {
      if (!versingFamily) {
        versingFamily = {
          name: "TBD, check rankings for likelihood of making it to playoffs",
          teamScore: "N/A"
        };
        family.pointsNeeded = { status: "N/A", message: "N/A" };
      } else {
        versingFamily.teamScore = calculateTeamScore(
          totalVersingFamilyPointsForWeek,
          versingFamilyParticipants.length
        );
        family.pointsNeededToWin = calculatePointsNeededToWin(
          family.teamScore,
          familyParticipants.length,
          versingFamily.teamScore,
          versingFamilyParticipants.length
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
        familyParticipants,
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
  let family, familyParticipants, displayAddPointsButton;
  const date = new Date(req.query.date);
  // current week is the week that it currently is according to today's date
  currentWeek = calculateWeekNumber(currentChallenge.date.end, getToday());
  // week number is the week that the user has requested data for (based on left and right arrows)
  requestedWeek = calculateWeekNumber(currentChallenge.date.end, date);

  Family.findOne({ name: req.params.familyName })
    .then(family => {
      return Participation.getChallengeParticipantsByFamily(
        currentChallenge._id,
        family._id
      );
    })
    .then(familyParticipantsArray => {
      familyParticipants = familyParticipantsArray;

      displayAddPointsButton = date > getToday() ? false : true;
      addPointsButtonDate = date;
      var user = req.params.familyName == user.family.name ? user : undefined;
      return Point.calculateParticipantPointsByDay(
        familyParticipants,
        addPointsButtonDate,
        user
      );
    })
    .then(() => {
      res.render("families/_daily_points", {
        familyParticipants,
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

function checkUserParticipation(familyParticipants, user) {
  familyParticipants.find(
    participant => participant._id.toString() === user._id.toString()
  );
}

// if requested week is the current week, default show date equals today,
// otherwise it is either Sunday if requesting the previous week or Monday
// if requesting the following week
function calculateDefaultShowDate(
  requestedWeek,
  currentWeek,
  today,
  direction,
  dates
) {
  if (requestedWeek === currentWeek) return today;
  return direction === "previous" ? dates[6] : dates[0];
}

// determines the date for the addpointsbutton
function calculateAddPointsButtonDate(
  currentWeek,
  requestedWeek,
  today,
  defaultShowDate
) {
  // if requested week is the current week,
  // addpointsbutton should have the default date (today)
  if (requestedWeek == currentWeek) return defaultShowDate;

  // if the default show date is greater than today's date,
  // users cannot add points for future dates
  if (defaultShowDate > today) return false;

  // if requesting the previous week and it's already past 12pm on monday,
  // don't display addpointsbutton otherwise display button with sunday's date
  const previousWeek = currentWeek - 1;
  if (requestedWeek == previousWeek && defaultShowDate.getDay() === 6) {
    if (today.getHours() >= 12 && today.getMilliseconds() > 0) return false;
    return defaultShowDate;
  }

  // if it's any other past week, don't display the add points button
  if (requestedWeek < currentWeek) return false;
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

function calculateTeamScore(totalScore, numOfParticipants) {
  numOfParticipants = numOfParticipants >= 5 ? numOfParticipants : 5;
  return (totalScore / numOfParticipants).toFixed(2);
}

function calculateTeamScore(totalScore, numOfParticipants) {}

function calculatePointsNeededToWin(
  familyTeamScore,
  numOfFamilyParticipants,
  versingTeamScore,
  numOfVersingFamilyParticipants
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
