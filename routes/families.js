const express = require('express');
const { addAsync } = require('@awaitjs/express');

// Models
const Family = require('./../models/family');
// const Challenge = require('./../models/challenge');
const Participant = require('./../models/participant');
const Point = require('./../models/point');
// const User = require('./../models/user');

const logger = require('../utils/logger');

const router = addAsync(express.Router());

// i.e. /Iolite
router.getAsync('/:familyName', async (req, res) => {
  const { currentChallenge } = res.locals;

  if (!currentChallenge) {
    // render family stats
    return res.send('Since there is no current challenge we will render family stats here. Coming soon');
  }

  const { familyName } = req.params;
  const { user } = res.locals;

  const { weekInfo } = req.query;
  const today = getToday();
  const dates = calculateDates(weekInfo);
  const timeRemaining = getTimeRemainingInWeek(dates[6]);
  const currentWeek = calculateWeekNumber(currentChallenge.date.end, today);
  const requestedWeek = calculateWeekNumber(currentChallenge.date.end, dates[6]);
  const isCurrentWeek = requestedWeek === currentWeek;
  const isFutureWeek = requestedWeek > currentWeek;
  const showPrevious = showPreviousWeek(currentChallenge.date.start, dates[0]);
  const showNext = showNextWeek(currentChallenge.date.start, dates[6], isCurrentWeek);

  // Compile a bunch of data to craft view

  // get the name of the next family this family will verse
  let nextVersingFamilyName;
  if (isCurrentWeek) {
    const nextWeek = `week${currentWeek + 1}`;
    nextVersingFamilyName = currentChallenge.schedule[nextWeek][familyName].versingFamily.name;
  }

  // TODO: can some of this be done in parallel?
  // Find the family who's page has been requested
  const family = await Family.findOne({ name: familyName });
  // then get all challenge participants in family
  const familyParticipants = await Participant.getChallengeParticipantsByFamily(currentChallenge._id, family._id);

  let versingFamily = determineVersingFamily(requestedWeek, currentWeek, currentChallenge, family.name);
  // then, if versingFamily, get all challenge participants in versing family

  let versingFamilyParticipants;
  if (versingFamily) {
    versingFamilyParticipants = await Participant.getChallengeParticipantsByFamily(currentChallenge._id, versingFamily._id);
  }

  // determine selected calendar date when user accesses family page
  // or when user chooses to switch weeks using arrow buttons
  // or when user chooses to select a specific date
  const defaultShowDate = calculateDefaultShowDate(isCurrentWeek, today, weekInfo, dates);

  let addPointsButtonDate;
  if (!isFutureWeek) {
    // determine if the points button should show and if so the date
    // it should hold for when user's choose to submit points
    addPointsButtonDate = calculateAddPointsButtonDate(currentWeek, requestedWeek, today, defaultShowDate);
  }

  // then total the points for each challenge participant
  // if the user requesting the page is part of the family
  // then move that user to the top
  await Point.calculateParticipantPointsByDay(
    familyParticipants,
    defaultShowDate,
    family.name === user.family.name ? user : undefined,
    isFutureWeek
  );

  // check if user is participating in the challenge
  user.isParticipating = checkUserParticipant(familyParticipants, user);

  if (user.isParticipating && addPointsButtonDate) {
    user.participantId = familyParticipants[0]._id;
  }

  // then, calculate points for the family for the entire week
  // if it is a future week, points will not get calculated
  let totalFamilyPointsForWeek;
  if (familyParticipants.length) {
    totalFamilyPointsForWeek = await Point.calculatePointsForWeek(familyParticipants, dates[0], dates[6]);
  } else {
    totalFamilyPointsForWeek = 0;
  }
  // then calculate the team score based on the total points
  // TODO: can we do something else if 0 points?
  family.teamScore = calculateTeamScore(totalFamilyPointsForWeek, familyParticipants.length);

  // then, calculate points for the versingFamily for the entire week
  // if it is a future week, points will not get calculated
  let totalVersingFamilyPointsForWeek;
  if (versingFamily && versingFamilyParticipants.length) {
    totalVersingFamilyPointsForWeek = await Point.calculatePointsForWeek(versingFamilyParticipants, dates[0], dates[6]);
  } else {
    totalVersingFamilyPointsForWeek = 0;
  }

  // then calculate the versing team score based on the total points
  if (!versingFamily) {
    versingFamily = {
      name: 'TBD, check rankings for likelihood of making it to playoffs',
      teamScore: 'N/A',
    };
    family.pointsNeededToWin = { status: 'N/A', message: 'N/A' };
  } else {
    versingFamily.teamScore = calculateTeamScore(totalVersingFamilyPointsForWeek, versingFamilyParticipants.length);
    family.pointsNeededToWin = calculatePointsNeededToWin(
      family.teamScore,
      familyParticipants.length,
      versingFamily.teamScore,
      versingFamilyParticipants.length
    );
  }

  const options = {
    isFutureWeek,
    isCurrentWeek,
    timeRemaining,
    dates,
    requestedWeek,
    family,
    versingFamily,
    familyParticipants,
    showPrevious,
    showNext,
    nextVersingFamilyName,
    defaultShowDate,
    addPointsButtonDate,
  };

  const view = req.xhr ? 'families/_show_body' : 'families/show';
  return res.render(view, options);
});

// GET all families
router.getAsync('/', async (req, res) => {
  const families = await Family.find();
  return res.render('families/index', {
    families,
    added: req.query.added,
  });
});

// GET add family form
router.get('/new', (req, res) => res.render('families/new'));

// POST create family
router.post('/', async (req, res) => {
  await new Family(req.body).save();
  return res.redirect(`/families?added=${req.body.name}`);
});

module.exports = router;

// PRIVATE FUNCTIONS

// calculates all the dates for a given week
function calculateDates(weekInfo) {
  let startDate;
  if (weekInfo) {
    if (weekInfo.direction === 'none') {
      startDate = new Date(weekInfo.monday);
    } else if (weekInfo.direction === 'previous') {
      startDate = new Date(weekInfo.monday);
      startDate.setDate(startDate.getDate() - 7);
    } else {
      startDate = new Date(weekInfo.sunday);
      startDate.setDate(startDate.getDate() + 1);
    }
  } else {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let day = today.getDay();
    day = day === 0 ? 7 : day;
    startDate = new Date(today.setDate(today.getDate() - (day - 1)));
  }
  const dates = [new Date(startDate)];
  for (let i = 0; i < 6; i += 1) {
    dates.push(new Date(startDate.setDate(startDate.getDate() + 1)));
  }
  return dates;
}

// if requesting a playoff week before playoffs, teams are not determined otherwise set the versing family
function determineVersingFamily(requestedWeek, currentWeek, currentChallenge, familyName) {
  if ((requestedWeek === 9 && currentWeek < 9) || (requestedWeek === 8 && currentWeek < 8)) {
    return false;
  }
  return currentChallenge.schedule[`week${requestedWeek}`][familyName].versingFamily;
}

function checkUserParticipant(familyParticipants, user) {
  logger.log('info:checkUserParticipant:familyParticipants', familyParticipants);
  return familyParticipants.find(participant => participant.user._id.toString() === user._id.toString());
}

// if requested week is the current week, default show date equals today,
// otherwise it is either Sunday if requesting the previous week or Monday
// if requesting the following week
function calculateDefaultShowDate(isCurrentWeek, today, weekInfo, dates) {
  // this has to be calculated first since user may want to see a future date in current week
  if (weekInfo && weekInfo.direction === 'none') return new Date(weekInfo.date);
  if (isCurrentWeek) return today;
  return weekInfo.direction === 'previous' ? dates[6] : dates[0];
}

// determines the date for the addpointsbutton
function calculateAddPointsButtonDate(isCurrentWeek, isPreviousWeek, today, defaultShowDate) {
  // if requesting the current week, then return
  // any date in the current week which is less than or equal to today
  if (isCurrentWeek) {
    // if (today.toString() === defaultShowDate.toString()) {
    return defaultShowDate <= today ? defaultShowDate : false;
  }

  // if
  // 1) requesting the previous week
  // 2) the current date is a monday and before 12pm
  // 3) all of last weeks days should be editable
  if (isPreviousWeek) {
    if (today.getDay() === 1) {
      const middayMonday = new Date(today);
      middayMonday.setHours(12, 0, 0, 0);
      if (new Date() < middayMonday) return defaultShowDate;
    }
  }

  return false;
}

// returns true if the start date does not equal Monday of requested week
function showPreviousWeek(challengeStartDate, monday) {
  return challengeStartDate.toString() !== monday.toString();
}

// returns true if the end date does not equal the Sunday of requested week
function showNextWeek(challengeEndDate, sunday, isCurrentWeek) {
  if (isCurrentWeek) return false;
  const dateAfterSunday = new Date(sunday.getTime());
  dateAfterSunday.setDate(sunday.getDate() + 1);
  return challengeEndDate.toString() !== dateAfterSunday.toString();
}

// have to get day before since challenge ends on
// Monday at 12:00:00 AM instead of Sunday at 11:59:59 PM
function calculateWeekNumber(challengeEndDate, sunday) {
  const dayBeforeEndDate = new Date(challengeEndDate.getTime());
  dayBeforeEndDate.setDate(dayBeforeEndDate.getDate() - 1);
  return Math.ceil((63 - Math.abs(dateDiffInDays(dayBeforeEndDate, sunday))) / 7);
}

// a and b are JavaScript Date objects
function dateDiffInDays(a, b) {
  const _MS_PER_DAY = 1000 * 60 * 60 * 24;
  // Discard the time and time-zone information.
  const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

  return Math.floor((utc2 - utc1) / _MS_PER_DAY);
}

function calculateTeamScore(totalScore, numOfParticipants) {
  numOfParticipants = numOfParticipants >= 5 ? numOfParticipants : 5;
  return (totalScore / numOfParticipants).toFixed(2);
}

// TODO: There is something wrong with this function
// needs test :D
function calculatePointsNeededToWin(familyTeamScore, numOfFamilyParticipants, versingFamilyTeamScore, numOfVersingFamilyParticipants) {
  numOfFamilyParticipants = numOfFamilyParticipants >= 5 ? numOfFamilyParticipants : 5;
  numOfVersingFamilyParticipants = numOfVersingFamilyParticipants >= 5 ? numOfVersingFamilyParticipants : 5;

  let status;
  let message;

  if (familyTeamScore > versingFamilyTeamScore) {
    status = 'Winning';
    message = '🔥🔥🔥   Winning   🔥🔥🔥';
  } else if (familyTeamScore < versingFamilyTeamScore) {
    status = 'Losing';
    const pointsAcquired = familyTeamScore * numOfFamilyParticipants;
    const pointsNeededToTie = versingFamilyTeamScore * numOfFamilyParticipants;
    const pointsNeededToWin = pointsNeededToTie - pointsAcquired;
    message = `😭😭👎   Need ${pointsNeededToWin} points to tie`;
  } else {
    status = 'Tied';
    message = '😅   Tied';
  }
  return {
    status,
    message,
  };
}

// gets the beginning of the day
function getToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
} // Subtracts the time between Monday at 12AM and now // and converts it to days/hours/minutes
function getTimeRemainingInWeek(endOfWeek) {
  const nextMonday = new Date(endOfWeek);
  nextMonday.setDate(nextMonday.getDate() + 1);
  const total = Date.parse(nextMonday) - Date.parse(new Date());
  const days = Math.floor(total / (1000 * 60 * 60 * 24));
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((total / 1000 / 60) % 60);
  return `${days} DAYS, ${hours} HOURS, ${minutes} MINUTES`;
}
