const mongoose = require("./mongoose"),
  Activity = require("../../models/activity"),
  User = require("../../models/user"),
  Family = require("../../models/family"),
  families = require("./json/families.json"),
  Challenge = require("../../models/challenge"),
  Point = require("../../models/point"),
  Participation = require("../../models/participation"),
  Unit = require("../../models/unit"),
  units = require("./json/units.json");

let iolite,
  activities,
  sunstone,
  ruby,
  emerald,
  sapphire,
  topaz,
  alexandrite,
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
            Object.empty = challenge;
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
            Object.empty = family;
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
            Object.empty = unit;
        }
      });
    })
    .catch(e => console.log(e));
}
function createActivities() {
  activities = [
    new Activity({
      name: "Jump roping",
      points: 1,
      scale: 150,
      unit: jump
    }),
    new Activity({
      name: "Biking(<5 min pace)",
      points: 2,
      scale: 1,
      unit: mile
    }),
    new Activity({
      name: "Biking(>5 min pace)",
      points: 1,
      scale: 1,
      unit: mile
    }),
    new Activity({
      name: "Biking(elevation)",
      points: 2,
      scale: 100,
      unit: feet
    }),
    new Activity({
      name: "Elliptical",
      points: 2,
      scale: 1,
      unit: mile
    }),
    new Activity({
      name: "Bowling",
      points: 2,
      scale: 1,
      unit: game
    }),
    new Activity({
      name: "Hiking",
      description: "outdoors on trail",
      points: 4,
      scale: 1,
      unit: mile
    }),
    new Activity({
      name: "Run/walk(10-15 min pace)",
      points: 3,
      scale: 1,
      unit: mile
    }),
    new Activity({
      name: "Hiking(elevation)",
      description: "after initial 1000ft.",
      points: 1.5,
      scale: 100,
      unit: feet
    }),
    new Activity({
      name: "Rowing",
      points: 4,
      scale: 1500,
      unit: meter
    }),
    new Activity({
      name: "Weightlifting",
      description: "body weight exercises like pushups, pullups etc. included",
      points: 4,
      scale: 15,
      unit: minute
    }),
    new Activity({
      name: "Swimming",
      points: 4,
      scale: 15,
      unit: minute
    }),
    new Activity({
      name: "Abs",
      description: "not in class",
      points: 4,
      scale: 15,
      unit: minute
    }),
    new Activity({
      name: "Running(<10 min pace)",
      points: 4,
      scale: 1,
      unit: mile
    }),
    new Activity({
      name: "Sports game",
      description:
        "basketball, volleyball, badminton, etc. (actual game, not just warming up)",
      points: 6,
      scale: 30,
      unit: minute
    }),
    new Activity({
      name: "Fitness class",
      description: "pilates, yoga, zumba, rock climbing, martial arts etc.",
      points: 8,
      scale: 1,
      unit: hour
    }),
    new Activity({
      name: "Golf",
      points: 12,
      scale: 9,
      unit: hole
    }),
    new Activity({
      name: "Intense workout",
      description: "p90x, parkour, cycling class, crossfit",
      points: 12,
      scale: 30,
      unit: minute
    }),
    new Activity({
      name: "Surfing",
      points: 12,
      scale: 1,
      unit: hour
    }),
    new Activity({
      name: "Snowboarding",
      points: 15,
      scale: 0.5,
      unit: day
    })
  ];
  return createObjs(activities);
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
            Object.empty = activity;
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
  users.map(user => {
    Participation.create({
      challenge: currentChallenge,
      user
    });
  });
}

async function createUsers() {
  const families = await Family.find();
  const users = require("./json/users.json");
  users.map(user => {
    User.create({
      family: families[Math.floor(Math.random() * families.length)],
      email: user.email,
      name: {
        first: user.name.first,
        last: user.name.last,
        nickname: user.name.nickname
      },
      password: user.password,
      lifetimePoints: user.lifetimePoints
    });
  });
}

// UNITS ARE SPECIFIC TO CERTAIN ACTIVITIES, HOW DO WE ASSIGN IT HERE?

// async function createActivities() {
//   const units = await Unit.find();
//   activities.map(activity => {
//     Activity.create({
//       family: families[Math.floor(Math.random() * families.length)],
//       email: user.email,
//       name: {
//         first: user.name.first,
//         last: user.name.last,
//         nickname: user.name.nickname
//       },
//       password: user.password,
//       lifetimePoints: user.lifetimePoints
//     });
//   });
// }

async function seedGlobalData() {
  await Family.create(families);
  await assignFamilies();
  await Unit.create(units);
  await assignUnits();
  await createActivities();
}

async function seedSampleData() {
  await createUsers();
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
