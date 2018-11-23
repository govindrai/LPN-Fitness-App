const mongoose = require("./mongoose"),
  Activity = require("../../models/activity"),
  User = require("../../models/user"),
  Family = require("../../models/family"),
  Challenge = require("../../models/challenge"),
  Point = require("../../models/point"),
  Participation = require("../../models/participation"),
  Unit = require("../../models/unit");

let iolite,
  sunstone,
  ruby,
  emerald,
  sapphire,
  topaz,
  alexandrite,
  units,
  users,
  families,
  activities,
  participations = [],
  mile,
  game,
  feet,
  meter,
  minute,
  hour,
  hole,
  day,
  jump,
  jumpRoping,
  bikingLess5,
  bikingMore5,
  bikingElevation,
  elliptical,
  bowling,
  hiking,
  runAndWalk,
  hikingElevation,
  rowing,
  weightlifting,
  swimming,
  abs,
  runningLess10,
  sportsGame,
  fitnessClass,
  golf,
  intenseWorkout,
  surfing,
  snowboarding,
  currentChallenge,
  nextYearChallenge,
  twoYearsLaterChallenge,
  lastYearChallenge,
  twoYearsAgoChallenge;

units = [
  {
    name: "Mile",
    abbreviation: "mi"
  },
  {
    name: "Game",
    abbreviation: "game"
  },
  {
    name: "Feet",
    abbreviation: "ft"
  },
  {
    name: "Meter",
    abbreviation: "mm"
  },
  {
    name: "Minute",
    abbreviation: "min"
  },
  {
    name: "Hour",
    abbreviation: "hr"
  },
  {
    name: "Hole",
    abbreviation: "hole"
  },
  {
    name: "Day",
    abbreviation: "day"
  },
  {
    name: "Jump",
    abbreviation: "jump"
  }
];

families = [
  {
    name: "Iolite",
    motto: "The best family",
    challengesWon: 3,
    playoffsReached: 4
  },
  {
    name: "Alexandrite",
    motto: "The 2nd best family",
    challengesWon: 4,
    playoffsReached: 3
  },
  {
    name: "Sunstone",
    motto: "A family in LPN",
    challengesWon: 5,
    playoffsReached: 2
  },
  {
    name: "Ruby",
    motto: "Another family in LPN",
    challengesWon: 3,
    playoffsReached: 1
  },
  {
    name: "Sapphire",
    motto: "Yet another family in LPN",
    challengesWon: 2,
    playoffsReached: 1
  },
  {
    name: "Topaz",
    motto: "A chill family in LPN",
    challengesWon: 2,
    playoffsReached: 2
  },
  {
    name: "Emerald",
    motto: "Almost forgot this family",
    challengesWon: 1,
    playoffsReached: 2
  },
  {
    name: "Bye"
  }
];

// generates an array of dates for two challenges in the past,
// two in the future and one in the present
// SEED FILE ONLY FUNCTION
function getMonday(date) {
  var monday = new Date(date.getTime());
  monday.setDate(date.getDate() - (date.getDay() - 1));
  return new Date(monday.getFullYear(), monday.getMonth(), monday.getDate());
}

function getChallengeStartDates() {
  var dates = [];

  var thisMonday = getMonday(new Date());

  var lastYear = new Date(thisMonday.getTime());
  lastYear.setDate(lastYear.getDate() - 365);

  var twoYearsAgo = new Date(thisMonday.getTime());
  twoYearsAgo.setDate(twoYearsAgo.getDate() - 730);

  var nextYear = new Date(thisMonday.getTime());
  nextYear.setDate(nextYear.getDate() + 365);

  var twoYearsLater = new Date(thisMonday.getTime());
  twoYearsLater.setDate(twoYearsLater.getDate() + 730);

  dates.push(
    thisMonday,
    getMonday(lastYear),
    getMonday(twoYearsAgo),
    getMonday(nextYear),
    getMonday(twoYearsLater)
  );
  return dates;
}

var startDates = getChallengeStartDates();

var challenges = [
  {
    name: "THE CURRENT CHALLENGE",
    date: {
      start: startDates[0]
    }
  }
  // new Challenge({
  //  name: 'LAST YEAR CHALLENGE',
  //  date: {
  //    start: startDates[1]
  //  }
  // }),
  // new Challenge({
  //  name: 'TWO YEARS AGO CHALLENGE',
  //  date: {
  //    start: startDates[2]
  //  }
  // }),
  // new Challenge({
  //  name: 'NEXT YEAR CHALLENGE',
  //  date: {
  //    start: startDates[3]
  //  }
  // }),
  // new Challenge({
  //  name: 'TWO YEARS LATER CHALLENGE',
  //  date: {
  //    start: startDates[4]
  //  }
  // })
];

// returns a promise that waits for all objects to be created (in parallel) in MongoDB
function createObjs(arr) {
  return Promise.all(arr.map(obj => obj.save()));
}

function assignChallenges() {
  return Challenge.find()
    .then(challenges => {
      challenges.forEach(challenge => {
        switch (challenge.name) {
          case "THE CURRENT CHALLENGE":
            currentChallenge = challenge;
            break;
          case "LAST YEAR CHALLENGE":
            lastYearChallenge = challenge;
            break;
          case "TWO YEARS AGO CHALLENGE":
            twoYearsAgoChallenge = challenge;
            break;
          case "NEXT YEAR CHALLENGE":
            nextYearChallenge = challenge;
            break;
          case "TWO YEARS LATER CHALLENGE":
            twoYearsLaterChallenge = challenge;
            break;
          default:
            console.log("i don't know that challenge");
        }
      });
    })
    .catch(e => console.log(e));
}

function assignFamilies() {
  return Family.find()
    .then(families => {
      families.forEach(family => {
        switch (family.name) {
          case "Iolite":
            iolite = family;
            break;
          case "Alexandrite":
            alexandrite = family;
            break;
          case "Sunstone":
            sunstone = family;
            break;
          case "Ruby":
            ruby = family;
            break;
          case "Sapphire":
            sapphire = family;
            break;
          case "Topaz":
            topaz = family;
            break;
          case "Emerald":
            emerald = family;
            break;
          default:
            console.log("i don't know that family");
        }
      });
    })
    .catch(e => console.log(e));
}

function assignUnits() {
  return Unit.find()
    .then(units => {
      units.forEach(unit => {
        switch (unit.name) {
          case "Mile":
            mile = unit;
            break;
          case "Game":
            game = unit;
            break;
          case "Feet":
            feet = unit;
            break;
          case "Meter":
            meter = unit;
            break;
          case "Minute":
            minute = unit;
            break;
          case "Hour":
            hour = unit;
            break;
          case "Hole":
            hole = unit;
            break;
          case "Day":
            day = unit;
            break;
          case "Jump":
            jump = unit;
            break;
          default:
            console.log("i don't know that unit");
        }
      });
    })
    .catch(e => console.log(e));
}

function assignActivities() {
  return Activity.find()
    .then(activities => {
      activities.forEach(activity => {
        switch (activity.name) {
          case "Jump roping":
            jumpRoping = activity;
            break;
          case "Biking(<5 min pace)":
            bikingLess5 = activity;
            break;
          case "Biking(>5 min pace)":
            bikingMore5 = activity;
            break;
          case "Biking(elevation)":
            bikingElevation = activity;
            break;
          case "Elliptical":
            elliptical = activity;
            break;
          case "Bowling":
            bowling = activity;
            break;
          case "Hiking":
            hiking = activity;
            break;
          case "Run/walk(10-15 min pace)":
            runAndWalk = activity;
            break;
          case "Hiking(elevation)":
            hikingElevation = activity;
            break;
          case "Rowing":
            rowing = activity;
            break;
          case "Weightlifting":
            weightlifting = activity;
            break;
          case "Swimming":
            swimming = activity;
            break;
          case "Abs":
            abs = activity;
            break;
          case "Running(<10 min pace)":
            runningLess10 = activity;
            break;
          case "Sports game":
            sportsGame = activity;
            break;
          case "Fitness class":
            fitnessClass = activity;
            break;
          case "Golf":
            golf = activity;
            break;
          case "Intense workout":
            intenseWorkout = activity;
            break;
          case "Surfing":
            surfing = activity;
            break;
          case "Snowboarding":
            snowboarding = activity;
            break;
          default:
            console.log("i don't know that activity");
        }
      });
    })
    .catch(e => console.log(e));
}

async function dropDb() {
  await mongoose.connection.dropDatabase();
}

async function createParticipations() {
  const users = await User.find();
  await Participation.create(
    users.map(user => {
      challenge: currentChallenge, user;
    })
  );
}

async function seedGlobalData() {
  await Family.create(families);
  await Activity.create(require("./activities.json"));
  await Unit.create(units);
  await assignUnits();
}

async function seedSampleData() {
  await User.create(require("./users.json"));
  await assignActivities();
  await Challenge.create(challenges);
  await assignChallenges();
  await createParticipations();
}

async function runner() {
  await dropDb();
  await seedGlobalData();
  await seedSampleData();
}

runner();
