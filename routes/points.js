// Modules
const express = require("express"),
  pug = require("pug"),
  path = require("path"),
  _ = require("lodash"),
  ObjectId = require("mongoose").Types.ObjectId;

// Models
var Activity = require("./../models/activity"),
  Point = require("./../models/point"),
  Family = require("./../models/family"),
  Unit = require("./../models/unit"),
  Challenge = require("./../models/challenge"),
  Participation = require("./../models/participation"),
  User = require("./../models/user");

var router = express.Router();

router.post("/", (req, res) => {
  console.log(req.body);
  let createPoints = [];
  let deletePointIds = [];
  let updatePoints = [];

  // convert body into array properties if single entry
  if (typeof req.body.activity !== "object") {
    req.body._id = [req.body._id];
    req.body.activity = [req.body.activity];
    req.body.numOfUnits = [req.body.numOfUnits];
    req.body.calculatedPoints = [req.body.calculatedPoints];
    req.body.date = [req.body.date];
  }

  const countOfActivities = req.body.activity.length;

  let calculatedPointsCounter = 0;
  for (var i = 0; i < countOfActivities; i++) {
    if (req.body.action[i] === "delete") {
      deletePointIds.push(req.body.point[i]);
      continue;
    }

    // need to add a post remove hook to decrease lifetime points
    // need to add a pre update hook when updating a point

    const pointsBody = {
      _id: req.body.point[i],
      participation: req.body.participation,
      user: res.locals.user._id,
      activity: req.body.activity[i],
      numOfUnits: req.body.numOfUnits[i],
      calculatedPoints: req.body.calculatedPoints[calculatedPointsCounter],
      date: req.body.date
    };

    if (req.body.action[i] === "update") {
      updatePoints.push(pointsBody);
    } else {
      delete pointsBody._id;
      createPoints.push(pointsBody);
    }
    calculatedPointsCounter++;
  }

  console.log("createPoints", createPoints);
  console.log("updatePoints", updatePoints);
  console.log("deletePoints", deletePointIds);

  let oldTotalPoints = 0;
  Promise.all(
    updatePoints.map(updatePoint => {
      return Point.findByIdAndUpdate(updatePoint._id, updatePoint).then(
        originalPoint => (oldTotalPoints += originalPoint.calculatedPoints)
      );
    })
  )
    .then(() => Point.insertMany(createPoints))
    .then(() => {
      const newTotalPoints = req.body.totalDailyPoints - oldTotalPoints;
      return res.locals.user.update({
        $inc: { lifetimePoints: newTotalPoints }
      });
    })
    .then(() => {
      res.redirect(res.locals.home);
    })
    .catch(e => console.log(e));
});

router.delete("/", function(req, res) {
  Point.remove({ _id: req.body.point })
    .then(doc => {
      res.status(200).send("Deleted!");
    })
    .catch(e => console.log(e));
});

module.exports = router;
