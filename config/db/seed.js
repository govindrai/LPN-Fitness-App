// TODO: Update seed job to replace existing documents
// Ideally seed job should replace items that already exist and not drop the database
// as that model would never work in production environments

// TODO: Rethink Participant Seed Data
// Need to rethink how seeding should work possibly as randomly creating a particpation for a user may not be the best decision
// Seed Job Data should preferably not be random and should be the same every time (in order to work w/ testing)
// Probably need another data file called participants.js

// NPM Modules
const mongoose = require('./mongoose');

// Mongoose Models
const Activity = require('../../models/activity');
const User = require('../../models/user');
const Family = require('../../models/family');
const Challenge = require('../../models/challenge');
// const Point = require('../../models/point');
// const Participant = require('../../models/participant');
const Unit = require('../../models/unit');

// Data Files
const families = require('./data/families');
const units = require('./data/units');
const activities = require('./data/activities');
const users = require('./data/users');
const challenges = require('./data/challenges');

// Utilities
const logger = require('../../utils/logger');

async function createActivities() {
  const units = await Unit.find();
  const unitIdsByName = {};
  units.forEach(unit => {
    unitIdsByName[unit.name] = unit._id;
  });
  activities.forEach(activity => {
    activity.unit = unitIdsByName[activity.unitName];
  });
  // logger.log('info:seed:createActivites:activities', activities);
  return Activity.create(activities);
}

async function createUsers() {
  const families = await Family.find();
  const familyNamesById = {};
  families.forEach(family => {
    familyNamesById[family.name] = family._id;
  });
  users.forEach(user => {
    user.family = familyNamesById[user.familyName];
  });
  logger.log('info:seed:createUsers:users', users);
  return User.create(users);
}

// async function createParticipants() {
//   const users = await User.find();
//   users.map(user => {
//     return Participant.create({
//       challenge: currentChallenge,
//       user,
//     });
//   });
// }

async function seedGlobalData() {
  await Family.create(families);
  await Unit.create(units);
  await createActivities();
}

async function seedSampleData() {
  await Challenge.create(challenges);
  await createUsers();
  // await createParticipants();
}

async function runner() {
  try {
    await mongoose.connect();
    await mongoose.dropDatabase();
    await seedGlobalData();
    await seedSampleData();
    process.exit(0);
  } catch (e) {
    logger.log('error:seed:runner', 'Seed Job Failed', e);
    process.exit(0);
  }
}

runner();
