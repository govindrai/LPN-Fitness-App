// MODULES
const mongoose = require("mongoose"),
  Schema = mongoose.Schema,
  schedule = require("node-schedule");

// MODELS
const Family = require("./family"),
  Participation = require("./participation"),
  Point = require("./point");

let challengeSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  date: {
    start: {
      type: Date,
      required: true
    },
    end: {
      type: Date,
      required: true
    },
    registrationStart: {
      type: Date,
      required: true
    },
    registrationEnd: {
      type: Date,
      required: true
    }
  },
  winner: {
    type: Schema.Types.ObjectId,
    ref: "Family",
    default: null
  },
  schedule: {
    type: Object,
    required: true
  },
  jobs: {
    type: Array
  },
  winCounts: {
    type: Object,
    required: true
  }
});

challengeSchema.pre("validate", function(next) {
  let challenge = this;
  if (challenge.date.registrationEnd) {
    next();
  } else {
    challenge.date.registrationEnd = this.date.start;
    challenge.date.end = getChallengeEndDate(challenge.date.start);
    challenge
      .generateSchedule()
      .then(schedule => {
        challenge.schedule = schedule;
        challenge.scheduleUpdateWeeklyWinsJob();
        next();
      })
      .catch(e => console.log("Problem inside generate Schedule", e));
  }
});

challengeSchema.statics.getCurrentChallenge = function() {
  return Challenge.findOne()
    .where("date.start")
    .lt(new Date())
    .where("date.end")
    .gt(new Date());
};

challengeSchema.statics.getPastChallenges = function() {
  return Challenge.find()
    .populate("winner")
    .where("date.end")
    .lt(new Date())
    .sort("date.start");
};

challengeSchema.statics.getFutureChallenges = function() {
  return Challenge.find().where("date.start").gt(new Date()).sort("date.start");
};

// sets the initial won/lost/tie counts to 0
challengeSchema.methods.generateInitialWinCounts = function(families) {
  var challenge = this;
  challenge.winCounts = {};

  families.forEach(family => {
    challenge.winCounts[family.name] = { Won: 0, Lost: 0, Tie: 0 };
  });
};

// GENERATES SCHEDULE FOR 9 WEEKS
challengeSchema.methods.generateSchedule = function() {
  var challenge = this;

  return Family.find().then(families => {
    shuffle(families);
    challenge.generateInitialWinCounts(families);

    // use below line to better debug
    // families = families.map(family => family.toObject());

    var schedule = {
      week1: {},
      week2: {},
      week3: {},
      week4: {},
      week5: {},
      week6: {},
      week7: {}
    };

    families.forEach((family, index) => {
      var newFamilies = families.filter(
        newFamily => newFamily.name != family.name
      );
      let week = 1,
        opponentCount = newFamilies.length;
      for (var i = 0; i < opponentCount; i++) {
        var weekNumber = "week" + week;
        if (schedule[weekNumber][family.name]) {
          // don't do anything since fam not free that week
        } else if (schedule[weekNumber][newFamilies[i].name]) {
          var tempFams = newFamilies.slice(i + 1);
          tempFams.some(tempFam => {
            if (schedule[weekNumber][tempFam.name]) {
              return false;
              // do nothing as fam is unavailable
            } else {
              // add a verse for opposing family
              schedule[weekNumber][family.name] = { versingFamily: tempFam };
              // add same entry for versing family
              schedule[weekNumber][tempFam.name] = { versingFamily: family };

              // now that a family has been added
              // swap places of added family with family that should've been added
              var matchingIndex;
              for (var j = 0; j < newFamilies.length; j++) {
                if (tempFam.name == newFamilies[j].name) {
                  matchingIndex = j;
                  break;
                }
              }
              newFamilies[matchingIndex] = newFamilies[i];
              return true;
            }
          });
        } else {
          // add a verse for opposing family
          schedule[weekNumber][family.name] = { versingFamily: newFamilies[i] };
          // add same entry for versing family
          schedule[weekNumber][newFamilies[i].name] = { versingFamily: family };
        }
        week++;
      }
    });

    for (let i = 8; i < 10; i++) {
      schedule["week" + i] = {};
      families.forEach(family => (schedule["week" + i][family.name] = {}));
    }

    Object.keys(schedule).forEach(week => {
      Object.keys(schedule[week]).forEach(contender => {
        schedule[week][contender].status = "TBD";
        schedule[week][contender].finalScore = "TBD";
        schedule[week][contender].versingFinalScore = "TBD";
      });
    });

    return schedule;
  });
};

// RETURNS SORTED FAMILY STANDINGS FOR CHALLENGE
challengeSchema.methods.getStandings = function() {
  const challenge = this;
  const families = Object.keys(challenge.schedule["week1"]);
  let standings = families.map(family => {
    let { Won: wins, Lost: losses, Tie: ties } = challenge.winCounts[family];
    return { family, score: wins - losses, wins, losses, ties };
  });
  standings.sort((a, b) => b.score - a.score);
  return standings;
};

challengeSchema.methods.scheduleUpdateWeeklyWinsJob = function() {
  const currentChallenge = this;

  // set the start time to start on week 2 Monday
  const startTime = new Date(this.date.start);
  startTime.setDate(startTime.getDate() + 7);

  // set the end time to end on week 10 Tuesday
  const endTime = new Date(this.date.end);
  endTime.setDate(endTime.getDate() + 1);

  const scheduleOptions = {
    start: startTime,
    end: endTime,
    hour: 12,
    minute: 0,
    second: 0,
    dayOfWeek: 1
  };

  // FOR TESTING, comment/uncomment previous/next five lines and change scheduleOptions to testSchedule options in schedule#scheduleJob
  // ######## TESTING START ############
  // const startTime = new Date(Date.now() + 15000);
  // const today = new Date();
  // const minute = today.getMinutes() + 1;
  // const dayOfWeek = today.getDay();
  // var scheduleOptions = {start: startTime, end: endTime, minute, dayOfWeek};
  // ######## TESTING END ############

  let counter = 1;

  schedule.scheduleJob(scheduleOptions, function() {
    var week = "week" + getWeekNumber(currentChallenge.date.end);
    var families = Object.keys(currentChallenge.schedule[week]);
    var versingFamilyParticipations;
    Promise.all(
      families.map(family => {
        var versingFamily =
          currentChallenge.schedule[week][family].versingFamily;
        return Participation.getParticipationForChallengeByFamily(
          currentChallenge._id,
          versingFamily._id
        )
          .then(versingFamilyParticipationsArray => {
            versingFamilyParticipations = versingFamilyParticipationsArray;
            var lastMonday = new Date();
            lastMonday.setDate(lastMonday.getDate() - 7);
            lastMonday = new Date(
              lastMonday.getFullYear(),
              lastMonday.getMonth(),
              lastMonday.getDate()
            );
            var mondayMorning = new Date();
            mondayMorning = new Date(
              mondayMorning.getFullYear(),
              mondayMorning.getMonth(),
              mondayMorning.getDate()
            );
            return Point.getTotalPointsForParticipationsByWeek(
              versingFamilyParticipations,
              lastMonday,
              mondayMorning
            );
          })
          .then(versingTotalPoints => {
            var versingFinalScore = calculatePoints(versingTotalPoints);
            currentChallenge.schedule[week][
              family
            ].versingFinalScore = versingFinalScore;
            var actualFamily =
              currentChallenge.schedule[week][family].versingFamily.name;
            currentChallenge.schedule[week][
              actualFamily
            ].finalScore = versingFinalScore;
          })
          .catch(e => console.log("WHAT's GOOING ON INSIDE PROMISE ALL", e));
      })
    )
      .then(() => {
        families.forEach(family => {
          var status;
          if (
            currentChallenge.schedule[week][family].finalScore ==
            currentChallenge.schedule[week][family].versingFinalScore
          ) {
            status = "Tie";
          } else if (
            currentChallenge.schedule[week][family].finalScore -
              currentChallenge.schedule[week][family].versingFinalScore <
            0
          ) {
            status = "Lost";
          } else {
            status = "Won";
          }
          currentChallenge.schedule[week][family].status = status;

          if (counter == 8 || counter == 9) {
            // Only add to the stats if you are in the playoffs
            if (
              currentChallenge.schedule[week][family].name != "Bye" &&
              currentChallenge.schedule[week][family].versingFamily.name !=
                "Bye"
            ) {
              currentChallenge.winCounts[family][status] += 1;
            }
          } else {
            if (
              currentChallenge.schedule[week][family].versingFamily.name ==
              "Bye"
            ) {
              currentChallenge.winCounts[family]["Won"] += 1;
            } else {
              currentChallenge.winCounts[family][status] += 1;
            }
          }
        });
        currentChallenge.markModified("schedule");
        currentChallenge.markModified("winCounts");
        return currentChallenge.save();
      })
      .then(() => {
        console.log("WORKER RAN!!!");
        counter++;
        if (counter == 7) {
          return challenge.getStandings().then(standingsArray => {
            let bye = standingsArray.find(
              standing => standing.family.name == "Bye"
            );
            challenge.schedule["week8"][
              standingsArray[0].family.name
            ].versingFamily =
              standingsArray[3].family;
            challenge.schedule["week8"][
              standingsArray[3].family.name
            ].versingFamily =
              standingsArray[0].family;
            challenge.schedule["week8"][
              standingsArray[1].family.name
            ].versingFamily =
              standingsArray[2].family;
            challenge.schedule["week8"][
              standingsArray[2].family.name
            ].versingFamily =
              standingsArray[1].family;
            standingsArray.slice(4).forEach(standing => {
              challenge.schedule["week8"][
                standing.family.name
              ].versingFamily = bye;
              challenge.schedule["week8"]["Bye"] = standing.family;
            });
            challenge.markModified("schedule");
            return challenge.save();
          });
        } else if (counter == 8) {
          return challenge.getStandings().then(standingsArray => {
            let bye = standingsArray.find(
              standing => standing.family.name == "Bye"
            );
            challenge.schedule["week9"][
              standingsArray[0].family.name
            ].versingFamily =
              standingsArray[1].family;
            challenge.schedule["week9"][
              standingsArray[1].family.name
            ].versingFamily =
              standingsArray[0].family;
            standingsArray.slice(2).forEach(standing => {
              challenge.schedule["week9"][
                standing.family.name
              ].versingFamily = bye;
              challenge.schedule["week9"]["Bye"] = standing.family;
            });
            challenge.markModified("schedule");
            return challenge.save();
          });
        }
      })
      .then(() => {
        console.log("Week 8 or Week 9 schedule has been updated!");
      })
      .catch(e => console.log("SCHEDULER FAILED BRO", e));
  });
};

var Challenge = mongoose.model("Challenge", challengeSchema);

module.exports = Challenge;

// Private Helper Functions
function getChallengeEndDate(startDate) {
  var date = new Date(startDate.getTime());
  date.setDate(startDate.getDate() + 63);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

// have to get day before since challenge ends on
// Monday at 12:00:00 AM instead of Sunday at 11:59:59 PM
function getWeekNumber(challengeEndDate) {
  beginningOfToday = new Date();
  beginningOfToday = new Date(
    beginningOfToday.getFullYear(),
    beginningOfToday.getMonth(),
    beginningOfToday.getDate()
  );
  return Math.ceil(
    (63 - Math.abs(dateDiffInDays(challengeEndDate, beginningOfToday))) / 7
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

function shuffle(array) {
  let counter = array.length;

  // While there are elements in the array
  while (counter > 0) {
    // Pick a random index
    let index = Math.floor(Math.random() * counter);

    // Decrease counter by 1
    counter--;

    // And swap the last element with it
    let temp = array[counter];
    array[counter] = array[index];
    array[index] = temp;
  }

  return array;
}

function calculatePoints(familyTotalPoints, numOfParticipants) {
  numOfParticipants = numOfParticipants >= 5 ? numOfParticipants : 5;
  return (familyTotalPoints / numOfParticipants).toFixed(2);
}
