// Modules
const router = require('express').Router();

// Models
// const Activity = require('./../models/activity');
const Point = require('./../models/point');
// const Family = require('./../models/family');
// const Unit = require('./../models/unit');
// const Challenge = require('./../models/challenge');
// const Participant = require('./../models/participant');
// const User = require('./../models/user');

router.post('/', (req, res) => {
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

  const countOfActivities = req.body.activity.length;

  let calculatedPointsCounter = 0;
  for (let i = 0; i < countOfActivities; i += 1) {
    if (req.body.action[i] === 'delete') {
      deletePointIds.push(req.body.point[i]);
      continue;
    }

    // need to add a post remove hook to decrease lifetime points
    // need to add a pre update hook when updating a point

    const pointsBody = {
      _id: req.body.point[i],
      participant: req.body.participant,
      user: res.locals.user._id,
      activity: req.body.activity[i],
      numOfUnits: req.body.numOfUnits[i],
      calculatedPoints: req.body.calculatedPoints[calculatedPointsCounter],
      date: req.body.date,
    };

    if (req.body.action[i] === 'update') {
      updatePoints.push(pointsBody);
    } else {
      delete pointsBody._id;
      createPoints.push(pointsBody);
    }
    calculatedPointsCounter += 1;
  }

  console.log('createPoints', createPoints);
  console.log('updatePoints', updatePoints);
  console.log('deletePoints', deletePointIds);

  let oldTotalPoints = 0;
  Promise.all(
    updatePoints.map(updatePoint => Point.findByIdAndUpdate(updatePoint._id, updatePoint).then(originalPoint => (oldTotalPoints += originalPoint.calculatedPoints)))
  )
    .then(() => Point.insertMany(createPoints))
    .then(() => Point.remove({ _id: { $in: deletePointIds } }))
    .then(() => {
      const newTotalPoints = req.body.totalDailyPoints - oldTotalPoints;
      return res.locals.user.update({
        $inc: { lifetimePoints: newTotalPoints },
      });
    })
    .then(() => {
      res.redirect(res.locals.home);
    })
    .catch(e => console.log(e));
});

router.delete('/', (req, res) => {
  Point.remove({ _id: req.body.point })
    .then(() => {
      res.status(200).send('Deleted!');
    })
    .catch(e => console.log(e));
});

module.exports = router;
