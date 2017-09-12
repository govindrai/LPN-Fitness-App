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
  var points = [];

  // setup conditional to take more than one point entry
  if (typeof req.body.activity == "object") {
    var countOfActivities = req.body.activity.length;

    for (var i = 0; i < countOfActivities; i++) {
      points.push({
        _id: req.body.point[i],
        participation: req.body.participation,
        user: res.locals.user._id,
        activity: req.body.activity[i],
        numOfUnits: req.body.numOfUnits[i],
        calculatedPoints: req.body.calculatedPoints[i],
        date: req.body.date
      });
    }
  } else {
    var body = _.pick(req.body, [
      "_id",
      "participation",
      "activity",
      "numOfUnits",
      "calculatedPoints",
      "date"
    ]);
    body.user = res.locals.user._id;
    points.push(body);
  }

  existingPoints = points.filter(point => point._id);
  newPoints = points.filter(point => {
    if (!point._id) {
      delete point._id;
      return true;
    }
  });

  let oldPoints = 0;
  Promise.all(
    existingPoints.map(existingPoint => {
      return Point.findByIdAndUpdate(existingPoint._id, existingPoint).then(
        oldUpdatedPoint => (oldPoints += oldUpdatedPoint.calculatedPoints)
      );
    })
  )
    .then(() => Point.insertMany(newPoints))
    .then(() => {
      totalPoints = req.body.totalPoints - oldPoints;
      return res.locals.user.update({
        $inc: { lifetimePoints: totalPoints }
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
