// Modules
const express = require('express');
const _ = require('lodash');
const { addAsync } = require('@awaitjs/express');
// Models
const Challenge = require('./../models/challenge');
// const Family = require('./../models/family');
const Participant = require('./../models/participant');
const User = require('./../models/user');
const Point = require('./../models/point');

// Middleware
const isAdmin = require('./../middleware/isAdmin');

const router = addAsync(express.Router());

// GET list all challenges
router.getAsync('/', async (req, res) => {
  // TODO: get all the challenges and challenges should have (completed, upcoming, current)
  const challenges = await Challenge.find();
  const proms = [];
  challenges.forEach(challenge => {
    proms.push(res.locals.user.setIsParticipantFlagOnChallenge(challenge));
    proms.push(challenge.getParticipantCount());
  });
  await Promise.all(proms);
  res.render('challenges/index', {
    futureChallenges: challenges.filter(challenge => challenge.status === 'Upcoming'),
    pastChallenges: challenges.filter(challenge => challenge.status === 'Completed'),
  });
});

// Create Challenge Form
router.getAsync('/new', isAdmin, async (req, res) => {
  const challenge = Challenge.findOne()
    .sort('-date.end')
    .select('date.end')
    .limit(1);
  const minDate = new Date(challenge.date.end);
  minDate.setDate(minDate.getDate() + 1);
  res.render('challenges/new', {
    challenge: new Challenge(),
    minDate,
  });
});

// Create Challenge
router.post('/', (req, res) => {
  const challenge = new Challenge({
    name: req.body.name,
    'date.start': req.body['date.start'],
    'date.end': req.body['date.end'],
  });
  challenge
    .save()
    .then(() => res.redirect('/challenges?created=true'))
    .catch(e => {
      if (e.name === 'ValidationError') {
        return res.render('challenges/new', { errors: e.errors, challenge });
      }
      return console.log(e);
    });
});

// get edit challenge form
router.get('/:id/edit', isAdmin, (req, res) => {
  Challenge.findById(req.params.id).then(challenge => {
    res.render('challenges/edit', { challenge });
  });
});

// Delete challenge
router.deleteAsync('/:id', async (req, res) => {
  // const users = [];
  // const points = [];
  await Challenge.remove({ _id: req.params.id });
  const participants = await Participant.find({ challenge: req.params.id });
  await Participant.remove({ challenge: req.params.id });
  const pointsArraysArray = await Promise.all(participants.map(participant => Point.find({ participant })));
  const pointsToDecrementArray = [];
  pointsArraysArray.forEach(pointsArray => {
    pointsToDecrementArray.push(pointsArray.reduce((total, point) => total + point.calculatedPoints), 0);
  });
  console.log('Still have access to participants?', participants);
  const decrementLifeTimePointPromises = participants.map(async (participant, index) => {
    const user = await User.findById(participant.user);
    return user.update({
      $inc: { lifetimePoints: pointsToDecrementArray[index] * -1 },
    });
  });

  await Promise.all(decrementLifeTimePointPromises);
  const participantIds = participants.map(participant => participant._id);
  await Point.remove({ _id: { $in: participantIds } });
  return res.redirect('/challenges');
});

// Edit Challenge
router.put('/:id', isAdmin, (req, res) => {
  const body = _.pick(req.body, ['name', 'date.start', 'date.end']);
  let challenge;

  Challenge.findById(req.params.id)
    .then(oldChallenge => {
      challenge = oldChallenge;
      const datesNotModified = oldChallenge.date.start.toLocaleDateString() === new Date(body['date.start']).toLocaleDateString();
      if (datesNotModified) {
        delete body['date.start'];
        delete body['date.end'];
      }
    })
    .then(() => {
      Challenge.findOneAndUpdate({ _id: challenge._id }, { $set: body }, { new: true, runValidators: true })
        .then(() => {
          res.redirect('/challenges');
        })
        .catch(e => console.log(e));
    });
});

module.exports = router;
