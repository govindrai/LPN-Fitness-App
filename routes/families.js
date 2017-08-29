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
    familyParticipations,
    versingFamilyParticipations,
    versingTotalPoints,
    defaultShowDate,
    addPointsButtonDate,
    dates,
    currentWeek,
    requestedWeek,
    isFutureWeek,
    isCurrentWeek,
    timeRemaining,
    showPrevious,
    showNext,
    nextVersingFamilyName,
    { familyName } = req.params,
    weekInfo = req.query.weekInfo,
    currentChallenge = res.locals.currentChallenge,
    today = getToday();

  dates = calculateDates(weekInfo);
  timeRemaining = getTimeRemainingInWeek(dates[6]);
  currentWeek = calculateWeekNumber(currentChallenge.date.end, today);
  requestedWeek = calculateWeekNumber(currentChallenge.date.end, dates[6]);
  isFutureWeek = requestedWeek > currentWeek;
  isCurrentWeek = requestedWeek === currentWeek;
  showPrevious = showPreviousWeek(currentChallenge.date.start, dates[0]);
  showNext = showNextWeek(currentChallenge.date.start, dates[6], isCurrentWeek);

  if (isCurrentWeek) {
    nextVersingFamilyName =
      currentChallenge.schedule["week" + (currentWeek + 1)][familyName]
        .versingFamily.name;
  }

  // Find the family who's page has been requested
  Family.findOne({ name: familyName })
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
    .then(familyParticipationsArray => {
      familyParticipations = familyParticipationsArray;
      // check if user is participating in the challenge
      user.isParticipating = checkUserParticipation(familyParticipations, user);
      // then, if versingFamily, get all challenge participants in versing family
      if (versingFamily) {
        return Participation.getChallengeParticipantsByFamily(
          currentChallenge._id,
          versingFamily._id
        );
      }
    })
    .then(versingFamilyParticipationsArray => {
      if (versingFamily) {
        versingFamilyParticipations = versingFamilyParticipationsArray;
      }

      // determine selected calendar date when user accesses family page
      // or when user chooses to switch weeks using arrow buttons
      defaultShowDate = calculateDefaultShowDate(
        requestedWeek,
        currentWeek,
        today,
        weekInfo,
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
        familyParticipations,
        defaultShowDate,
        family.name === user.family.name ? user : undefined,
        isFutureWeek
      );
    })
    .then(() => {
      // then, calculate points for the family for the entire week
      // if it is a future week, points will not get calculated
      return Point.calculatePointsForWeek(
        familyParticipations,
        dates[0],
        dates[6],
        isFutureWeek
      );
    })
    .then(totalFamilyPointsForWeek => {
      // then calculate the team score based on the total points
      family.teamScore = calculateTeamScore(
        totalFamilyPointsForWeek,
        familyParticipations.length
      );
    })
    .then(() => {
      // then, calculate points for the versingFamily for the entire week
      // if it is a future week, points will not get calculated
      if (versingFamily) {
        return Point.calculatePointsForWeek(
          versingFamilyParticipations,
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
        family.pointsNeededToWin = { status: "N/A", message: "N/A" };
      } else {
        versingFamily.teamScore = calculateTeamScore(
          totalVersingFamilyPointsForWeek,
          versingFamilyParticipations.length
        );
        family.pointsNeededToWin = calculatePointsNeededToWin(
          family.teamScore,
          familyParticipations.length,
          versingFamily.teamScore,
          versingFamilyParticipations.length
        );
      }

      const options = {
        isFutureWeek,
        timeRemaining,
        dates,
        requestedWeek,
        family,
        versingFamily,
        familyParticipations,
        showPrevious,
        showNext,
        nextVersingFamilyName,
        defaultShowDate,
        addPointsButtonDate
      };

      const view = req.xhr ? "families/_show_body" : "families/show";
      return res.render(view, options);
    })
    .catch(e => console.log(e));
});

router.get("/:familyName/points", (req, res) => {
  let family,
    currentWeek,
    requestedWeek,
    familyParticipations,
    defaultShowDate,
    addPointsButtonDate,
    isFutureWeek,
    dates,
    user = res.locals.user,
    { familyName } = req.params,
    currentChallenge = res.locals.currentChallenge,
    today = getToday(),
    { weekInfo } = req.query;

  dates = calculateDates(weekInfo);
  currentWeek = calculateWeekNumber(currentChallenge.date.end, today);
  requestedWeek = calculateWeekNumber(currentChallenge.date.end, dates[6]);
  isFutureWeek = requestedWeek > currentWeek;

  Family.findOne({ name: familyName })
    .then(familyObj => {
      family = familyObj;
      return Participation.getChallengeParticipantsByFamily(
        currentChallenge._id,
        family._id
      );
    })
    .then(familyParticipationsArray => {
      familyParticipations = familyParticipationsArray;

      defaultShowDate = new Date(weekInfo.date);

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

      console.log("addPointsButtonDate", addPointsButtonDate);

      return Point.calculateParticipantPointsByDay(
        familyParticipations,
        defaultShowDate,
        family.name === user.family.name ? user : undefined,
        isFutureWeek
      );
    })
    .then(() => {
      res.render("families/_calendar", {
        isFutureWeek,
        family,
        defaultShowDate,
        dates,
        familyParticipations,
        addPointsButtonDate
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
    if (weekInfo.direction === "none") {
      startDate = new Date(weekInfo.monday);
    } else if (weekInfo.direction === "previous") {
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

function checkUserParticipation(familyParticipations, user) {
  familyParticipations.find(
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
  weekInfo,
  dates
) {
  if (requestedWeek === currentWeek) return today;
  return weekInfo.direction === "previous" ? dates[6] : dates[0];
}

// determines the date for the addpointsbutton
function calculateAddPointsButtonDate(
  currentWeek,
  requestedWeek,
  today,
  defaultShowDate
) {
  // if the requested date is today, then return today's date
  if (today.toString() === defaultShowDate.toString()) return defaultShowDate;

  // if
  // 1) requesting the previous week
  // 2) date requested is sunday
  // 3) the current date is a monday and before 12pm
  // display addpointsbutton with sunday's date
  const previousWeek = currentWeek - 1;
  if (requestedWeek === previousWeek && defaultShowDate.getDay() === 7) {
    if (today.getDay() === 1) {
      middayMonday = new Date(today);
      middayMonday.setHours(12, 0, 0, 0);
      if (new Date() < middayMonday) return defaultShowDate;
    }
  }

  return false;
}

// returns true if the start date does not equal Monday of requested week
function showPreviousWeek(challengeStartDate, monday) {
  return challengeStartDate.toString() != monday.toString();
}

// returns true if the end date does not equal the Sunday of requested week
function showNextWeek(challengeEndDate, sunday, isCurrentWeek) {
  if (isCurrentWeek) return false;
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

function calculatePointsNeededToWin(
  familyTeamScore,
  numOfFamilyParticipations,
  versingFamilyTeamScore,
  numOfVersingFamilyParticipations
) {
  numOfFamilyParticipations =
    numOfFamilyParticipations >= 5 ? numOfFamilyParticipations : 5;
  numOfVersingFamilyParticipations =
    numOfVersingFamilyParticipations >= 5
      ? numOfVersingFamilyParticipations
      : 5;

  let status, message;

  if (familyTeamScore > versingFamilyTeamScore) {
    status = "Winning";
    message = "🔥🔥🔥   Winning   🔥🔥🔥";
  } else if (familyTeamScore < versingFamilyTeamScore) {
    status = "Losing";
    const pointsAcquired = familyTeamScore * numOfFamilyParticipations;
    const pointsNeededToTie =
      versingFamilyTeamScore * numOfFamilyParticipations;
    const pointsNeededToWin = pointsNeededToTie - pointsAcquired;
    message = `😭😭👎   Need ${pointsNeededToWin} points to tie`;
  } else {
    status = "Tied";
    message = "😅   Tied";
  }
  return {
    status,
    message
  };
} // gets the beginning of the day
function getToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
} // Subtracts the time between Monday at 12AM and now // and converts it to days/hours/minutes
function getTimeRemainingInWeek(endOfWeek) {
  let nextMonday = new Date(endOfWeek);
  nextMonday.setDate(nextMonday.getDate() + 1);
  const total = Date.parse(nextMonday) - Date.parse(new Date()),
    days = Math.floor(total / (1000 * 60 * 60 * 24)),
    hours = Math.floor(total / (1000 * 60 * 60) % 24),
    minutes = Math.floor(total / 1000 / 60 % 60);
  return `${days} DAYS, ${hours} HOURS, ${minutes} MINUTES`;
}
