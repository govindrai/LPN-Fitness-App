// Modules
const router = require('express').Router();

const logger = require('../utils/logger');
const { wrap } = require('../utils/utils');

// Models
// const Activity = require('./../models/activity');
const Point = require('./../models/point');
// const Family = require('./../models/family');
// const Unit = require('./../models/unit');
// const Challenge = require('./../models/challenge');
// const Participant = require('./../models/participant');
// const User = require('./../models/user');

router.post('/', wrap(async (req, res, next) => {
  console.log(req.body);
  const createPoints = [];
  const deletePointIds = [];
  const updatePoints = [];

  // convert body into array properties if single entry
  if (typeof req.body.activity !== 'object') {
    req.body._id = [req.body._id];
    req.body.activity = [req.body.activity];
    req.body.numOfUnits = [req.body.numOfUnits];
    req.body.calculatedPoints = [req.body.calculatedPoints];
    req.body.date = [req.body.date];
  }

  logger.debug(req.body);

  const countOfActivities = req.body.activity.length;

  let calculatedPointsCounter = 0;
  for (let i = 0; i < countOfActivities; i += 1) {
    if (req.body.action[i] === 'delete') {
      deletePointIds.push(req.body.point[i]);
    }

    // TODO: need to add a post remove hook to decrease lifetime points
    // TODO: need to add a pre update hook when updating a point

    const pointsBody = {
      _id: req.body.point[i],
      participant: req.body.participant,
      user: res.locals.user._id,
      activity: req.body.activity[i],
      numOfUnits: req.body.numOfUnits[i],
      calculatedPoints: req.body.calculatedPoints[calculatedPointsCounter],
      date: req.body.date,
    };

    const action = req.body.action[i];
    if (action !== 'ignore') {
      if (action === 'update') {
        updatePoints.push(pointsBody);
      } else {
        delete pointsBody._id;
        createPoints.push(pointsBody);
      }
    }
    calculatedPointsCounter += 1;
  }

  console.log('createPoints', createPoints);
  console.log('updatePoints', updatePoints);
  console.log('deletePoints', deletePointIds);

  let oldTotalPoints = 0;
  const updateProms = updatePoints.map(async updatePoint => {
    const originalPoint = await Point.findByIdAndUpdate(updatePoint._id, updatePoint);
    oldTotalPoints += originalPoint.calculatedPoints;
  });

  await Promise.all(updateProms);
  await Point.insertMany(createPoints);
  await Point.remove({ _id: { $in: deletePointIds } });
  const newTotalPoints = req.body.totalDailyPoints - oldTotalPoints;
  await res.locals.user.update({ $inc: { lifetimePoints: newTotalPoints } });
  res.redirect(res.locals.homePath);
}));

router.delete('/', wrap(async (req, res, next) => {
  await Point.remove({ _id: req.body.point });
  res.send('Deleted!');
}));

module.exports = router;
