// TODO: Update seed job to replace existing documents
// Ideally seed job should replace items that already exist and not drop the database
// as that model would never work in production environments

// TODO: Rethink Participant Seed Data
// Need to rethink how seeding should work possibly as randomly creating a particpation for a user may not be the best decision
// Seed Job Data should preferably not be random and should be the same every time (in order to work w/ testing)
// Probably need another data file called participants.js

// Local DB connector module
const mongoose = require('./mongoose');

// Mongoose Models
const Activity = require('../../models/activity');
const User = require('../../models/user');
const Family = require('../../models/family');
const Challenge = require('../../models/challenge');
// const Point = require('../../models/point');
const Participant = require('../../models/participant');
const Unit = require('../../models/unit');

// Data Files
const familiesData = require('./data/families');
const unitsData = require('./data/units');
const activitiesData = require('./data/activities');
const usersData = require('./data/users');
const challengesData = require('./data/challenges');

// Utilities
const logger = require('../../utils/logger');

async function createActivities() {
  const units = await Unit.find();
  const unitIdsByName = {};
  units.forEach(unit => {
    unitIdsByName[unit.name] = unit._id;
  });
  activitiesData.forEach(activity => {
    activity.unit = unitIdsByName[activity.unitName];
  });
  return Activity.create(activitiesData);
}

async function createUsers() {
  const families = await Family.find();
  const familyNamesById = {};
  families.forEach(family => {
    familyNamesById[family.name] = family._id;
  });
  usersData.forEach(user => {
    user.family = familyNamesById[user.familyName];
  });
  return User.create(usersData);
}

async function createParticipants() {
  const users = await User.find();
  const currentChallenge = await Challenge.getCurrentChallenge();
  console.log('*****************', currentChallenge);
  const participantsData = users.map(user => ({
    challenge: currentChallenge,
    user,
  }));
  return Participant.create(participantsData);
}

async function seedGlobalData() {
  await Family.create(familiesData);
  await Unit.create(unitsData);
  await createActivities();
}

async function seedSampleData() {
  await Challenge.create(challengesData);
  await createUsers();
  await createParticipants();
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
