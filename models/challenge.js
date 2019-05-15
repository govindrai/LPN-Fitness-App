// MODULES
const mongoose = require('mongoose');

const scheduler = require('node-schedule');

// MODELS
const Family = require('./family');
const Participant = require('./participant');
const Point = require('./point');

const challengeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  date: {
    start: {
      type: Date,
      required: true,
      validate: [
        {
          isAsync: true,
          validator: isOverlappingChallenge,
        },
        {
          validator: value => value.getDay() === 1,
          message: 'Challenges must start on Mondays.',
        },
      ],
    },
    end: {
      type: Date,
      required: true,
    },
    registrationStart: {
      type: Date,
      required: true,
      default: new Date(),
    },
    registrationEnd: {
      type: Date,
      required: true,
    },
  },
  winner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Family',
    default: null,
  },
  schedule: {
    type: Object,
    required: true,
  },
  jobs: {
    type: Array,
  },
  winCounts: {
    type: Object,
    required: true,
  },
  status: {
    type: String,
    enum: ['Completed', 'Upcoming', 'Current'],
    default: 'Upcoming',
    required: true,
  },
});

challengeSchema.pre('validate', async function preValidateHook() {
  const challenge = this;
  if (challenge.date.registrationEnd) {
    return;
  }
  challenge.date.registrationEnd = this.date.start;
  challenge.date.end = getChallengeEndDate(challenge.date.start);
  challenge.schedule = await challenge.generateSchedule();
  challenge.scheduleUpdateWeeklyWinsJobs();
});

challengeSchema.statics = {
  // TODO: write tests for these functions because they are incorrect. Use TDD
  // returns any active challenge today is at least the start or the end of the challenge
  getCurrentChallenge() {
    return mongoose
      .model('Challenge')
      .findOne()
      .where('date.start')
      .lt(new Date())
      .where('date.end')
      .gt(new Date());
  },
  getPastChallenges() {
    return mongoose
      .model('Challenge')
      .find()
      .populate('winner')
      .where('date.end')
      .lt(new Date())
      .sort('date.start');
  },
  getFutureChallenges() {
    return mongoose
      .model('Challenge')
      .find()
      .where('date.start')
      .gt(new Date())
      .sort('date.start');
  },
};

challengeSchema.methods = {
  // sets the initial won/lost/tie metrics for each family in the challenge to 0
  // the reason we don't use this function as winCounts' mongoose schema default paramter
  // is because we need all familiy records which we don't have at schema initialization and need to asynchronously fetch
  generateInitialWinCounts(families) {
    const challenge = this;
    challenge.winCounts = {};

    families.forEach(family => {
      challenge.winCounts[family.name] = { Won: 0, Lost: 0, Tie: 0 };
    });
  },

  // gets the number of participants for the challenge
  async getParticipantCount() {
    const participantCount = await Participant.count({ challenge: this._id });
    this.participantCount = participantCount;
  },

  // Generates a 9 week schedule
  // TODO: Document the actual schedule that needs to be generated..
  async generateSchedule() {
    const families = await Family.find();
    shuffle(families);
    this.generateInitialWinCounts(families);

    // use below line to better debug
    // families = families.map(family => family.toObject());

    const schedule = {
      week1: {},
      week2: {},
      week3: {},
      week4: {},
      week5: {},
      week6: {},
      week7: {},
    };

    families.forEach(family => {
      const newFamilies = families.filter(newFamily => newFamily.name !== family.name);
      let week = 1;

      const opponentCount = newFamilies.length;
      for (let i = 0; i < opponentCount; i += 1) {
        const weekNumber = `week${week}`;
        if (schedule[weekNumber][family.name]) {
          // don't do anything since fam not free that week
        } else if (schedule[weekNumber][newFamilies[i].name]) {
          const tempFams = newFamilies.slice(i + 1);
          tempFams.some(tempFam => {
            if (schedule[weekNumber][tempFam.name]) {
              return false;
              // do nothing as fam is unavailable
            }
            // add a verse for opposing family
            schedule[weekNumber][family.name] = { versingFamily: tempFam };
            // add same entry for versing family
            schedule[weekNumber][tempFam.name] = { versingFamily: family };

            // now that a family has been added
            // swap places of added family with family that should've been added
            let matchingIndex;
            for (let j = 0; j < newFamilies.length; j += 1) {
              if (tempFam.name === newFamilies[j].name) {
                matchingIndex = j;
                break;
              }
            }
            newFamilies[matchingIndex] = newFamilies[i];
            return true;
          });
        } else {
          // add a verse for opposing family
          schedule[weekNumber][family.name] = { versingFamily: newFamilies[i] };
          // add same entry for versing family
          schedule[weekNumber][newFamilies[i].name] = { versingFamily: family };
        }
        week += 1;
      }
    });

    for (let i = 8; i < 10; i += 1) {
      schedule[`week${i}`] = {};
      families.forEach(family => {
        schedule[`week${i}`][family.name] = {};
      });
    }

    Object.keys(schedule).forEach(week => {
      Object.keys(schedule[week]).forEach(contender => {
        schedule[week][contender].status = 'TBD';
        schedule[week][contender].finalScore = 'TBD';
        schedule[week][contender].versingFinalScore = 'TBD';
      });
    });

    return schedule;
  },

  // RETURNS SORTED FAMILY STANDINGS FOR CHALLENGE
  getStandings() {
    const challenge = this;
    const families = Object.keys(challenge.schedule.week1).filter(family => family !== 'Bye');
    const standings = families.map(family => {
      const { Won: wins, Lost: losses, Tie: ties } = challenge.winCounts[family];
      return {
        family,
        score: wins - losses,
        wins,
        losses,
        ties,
      };
    });
    standings.sort((a, b) => b.score - a.score);
    return standings;
  },

  scheduleUpdateWeeklyWinsJobs() {
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
      dayOfWeek: 1,
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
    async function thisFunctionIsSupposedToDoSomeJob() {
      const week = `week${getWeekNumber(currentChallenge.date.end)}`;
      const families = Object.keys(currentChallenge.schedule[week]);
      await Promise.all(
        families.map(async family => {
          const { versingFamily } = currentChallenge.schedule[week][family];
          const versingFamilyParticipants = await Participant.getParticipantForChallengeByFamily(currentChallenge._id, versingFamily._id);
          let lastMonday = new Date();
          lastMonday.setDate(lastMonday.getDate() - 7);
          lastMonday = new Date(lastMonday.getFullYear(), lastMonday.getMonth(), lastMonday.getDate());
          let mondayMorning = new Date();
          mondayMorning = new Date(mondayMorning.getFullYear(), mondayMorning.getMonth(), mondayMorning.getDate());
          const totalVersingParticipantPoints = await Point.getTotalPointsForParticipantsByWeek(
            versingFamilyParticipants,
            lastMonday,
            mondayMorning
          );
          const versingFamilyFinalScore = calculatePoints(totalVersingParticipantPoints);
          currentChallenge.schedule[week][family].versingFinalScore = versingFamilyFinalScore;
          const actualFamily = currentChallenge.schedule[week][family].versingFamily.name;
          currentChallenge.schedule[week][actualFamily].finalScore = versingFamilyFinalScore;
        })
      );
      families.forEach(family => {
        let status;
        if (currentChallenge.schedule[week][family].finalScore === currentChallenge.schedule[week][family].versingFinalScore) {
          status = 'Tie';
        } else if (currentChallenge.schedule[week][family].finalScore - currentChallenge.schedule[week][family].versingFinalScore < 0) {
          status = 'Lost';
        } else {
          status = 'Won';
        }
        currentChallenge.schedule[week][family].status = status;

        if (counter === 8 || counter === 9) {
          // Only add to the stats if you are in the playoffs
          if (
            currentChallenge.schedule[week][family].name !== 'Bye'
            && currentChallenge.schedule[week][family].versingFamily.name !== 'Bye'
          ) {
            currentChallenge.winCounts[family][status] += 1;
          }
        } else if (currentChallenge.schedule[week][family].versingFamily.name === 'Bye') {
          currentChallenge.winCounts[family].Won += 1;
        } else {
          currentChallenge.winCounts[family][status] += 1;
        }
      });

      currentChallenge.markModified('schedule');
      currentChallenge.markModified('winCounts');
      await currentChallenge.save();

      console.log('WORKER RAN!!!');
      counter += 1;
      if (counter === 7) {
        const standings = await this.getStandings();
        const bye = standings.find(standing => standing.family.name === 'Bye');
        this.schedule.week8[standings[0].family.name].versingFamily = standings[3].family;
        this.schedule.week8[standings[3].family.name].versingFamily = standings[0].family;
        this.schedule.week8[standings[1].family.name].versingFamily = standings[2].family;
        this.schedule.week8[standings[2].family.name].versingFamily = standings[1].family;
        standings.slice(4).forEach(standing => {
          this.schedule.week8[standing.family.name].versingFamily = bye;
          this.schedule.week8.Bye = standing.family;
        });
        this.markModified('schedule');
        await this.save();
      }
      if (counter === 8) {
        const standings = await this.getStandings();
        const bye = standings.find(standing => standing.family.name === 'Bye');
        this.schedule.week9[standings[0].family.name].versingFamily = standings[1].family;
        this.schedule.week9[standings[1].family.name].versingFamily = standings[0].family;
        standings.slice(2).forEach(standing => {
          this.schedule.week9[standing.family.name].versingFamily = bye;
          this.schedule.week9.Bye = standing.family;
        });
        this.markModified('schedule');
        await this.save();
      }
      console.log('Week 8 or Week 9 schedule has been updated!');
    }

    scheduler.scheduleJob(scheduleOptions, thisFunctionIsSupposedToDoSomeJob);
  },
};

const Challenge = mongoose.model('Challenge', challengeSchema);

module.exports = Challenge;

// Private Helper Functions
function getChallengeEndDate(startDate) {
  const date = new Date(startDate.getTime());
  date.setDate(startDate.getDate() + 63);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

// have to get day before since challenge ends on
// Monday at 12:00:00 AM instead of Sunday at 11:59:59 PM
function getWeekNumber(challengeEndDate) {
  let beginningOfToday = new Date();
  beginningOfToday = new Date(beginningOfToday.getFullYear(), beginningOfToday.getMonth(), beginningOfToday.getDate());
  return Math.ceil((63 - Math.abs(dateDiffInDays(challengeEndDate, beginningOfToday))) / 7);
}

// a and b are javascript Date objects
function dateDiffInDays(a, b) {
  const _MS_PER_DAY = 1000 * 60 * 60 * 24;
  // Discard the time and time-zone information.
  const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

  return Math.floor((utc2 - utc1) / _MS_PER_DAY);
}

// TODO: move to utilities file
function shuffle(array) {
  let counter = array.length;

  // While there are elements in the array
  while (counter > 0) {
    // Pick a random index
    const index = Math.floor(Math.random() * counter);

    // Decrease counter by 1
    counter -= 1;

    // And swap the last element with it
    const temp = array[counter];
    array[counter] = array[index];
    array[index] = temp;
  }

  return array;
}

function calculatePoints(familyTotalPoints, numOfParticipants) {
  numOfParticipants = numOfParticipants >= 5 ? numOfParticipants : 5;
  return (familyTotalPoints / numOfParticipants).toFixed(2);
}

function isOverlappingChallenge(inputStartDate, cb) {
  const endDate = getChallengeEndDate(inputStartDate);
  Challenge.findOne()
    .where('date.start')
    .lte(inputStartDate)
    .where('date.end')
    .gte(inputStartDate)
    .then(existingChallenge => {
      if (existingChallenge) {
        return cb(
          !existingChallenge,
          `Challenge ${
            existingChallenge.name
          } is already scheduled from ${existingChallenge.date.start.toLocaleDateString()} - ${existingChallenge.date.end.toLocaleDateString()}. Only one challenge can occur at any given time. Please select different dates.`
        );
      }
      return Challenge.findOne()
        .where('date.start')
        .lte(endDate)
        .where('date.end')
        .gte(endDate);
    })
    .then(existingChallenge => {
      if (existingChallenge) {
        return cb(
          !existingChallenge,
          `Challenge ${
            existingChallenge.name
          } is already scheduled from ${existingChallenge.date.start.toLocaleDateString()} - ${existingChallenge.date.end.toLocaleDateString()}. Only one challenge can occur at any given time. Please select different dates.`
        );
      }
      return cb(!existingChallenge);
    })
    .catch(e => console.log(e));
}
