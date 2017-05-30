var mongoose = require('./mongoose'),
  Activity = require('./../models/activity'),
  User = require('./../models/user'),
  Family = require('./../models/family'),
  Challenge = require('./../models/challenge'),
  Point = require('./../models/point'),
  // Participation = require('./../models/participation'),
  Unit = require('./../models/unit');

// User.insertMany([
// ])

// new Promise(resolve.Family.remove({justOne: false})

Family.insertMany([
  {
    name: 'Iolite',
    motto: 'The best family',
    challengesWon: 3,
    playoffsReached: 4
  },
  {
    name: 'Alexandrite',
    motto: 'The 2nd best family',
    challengesWon: 4,
    playoffsReached: 3
  },
  {
    name: 'Sunstone',
    motto: 'A family in LPN',
    challengesWon: 5,
    playoffsReached: 2
  },
  {
    name: 'Ruby',
    motto: 'Another family in LPN',
    challengesWon: 3,
    playoffsReached: 1
  },
  {
    name: 'Sapphire',
    motto: 'Yet another family in LPN',
    challengesWon: 2,
    playoffsReached: 1
  },
  {
    name: 'Topaz',
    motto: 'A chill family in LPN',
    challengesWon: 2,
    playoffsReached: 2
  },
  {
    name: 'Emerald',
    motto: 'Almost forgot this family',
    challengesWon: 1,
    playoffsReached: 2
  }
])
.then(users => console.log("success"))
.catch(e => console.log(e));

