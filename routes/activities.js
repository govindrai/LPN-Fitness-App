// Modules
const express = require("express"),
  pug = require("pug");

// Models
const Activity = require("./../models/activity"),
  Unit = require("./../models/unit");

// Middleware
const isAdmin = require("./../middleware/isAdmin");

const router = express.Router();

// GET list all activities
router.get("/", (req, res) => {
  // XHR for typeahead (just need names)
  if (req.xhr) {
    Activity.find()
      .select("name")
      .then(activities => {
        res.send(activities.map(activity => activity.name));
      })
      .catch(e => console.log(e));
  } else {
    // For activities index page
    Activity.find()
      .populate("unit")
      .then(activities => res.render("activities/index", { activities }));
  }
});

// GET new activity form
router.get("/new", isAdmin, (req, res) => {
  Unit.find().then(units => {
    Activity.find()
      .populate("unit")
      .then(activities => {
        res.render("activities/new", { units, activities });
      });
  });
});

// GET activity info
router.get("/:activityName", (req, res) => {
  if (req.xhr) {
    Activity.findOne({ name: req.params.activityName })
      .populate("unit")
      .then(activity => {
        res.send(
          pug.renderFile(process.env.PWD + "/views/points/_points_entry.pug", {
            activity,
            date: new Date()
          })
        );
      })
      .catch(e => console.log(e));
  } else {
    res.status(400).send("Not an XHR request");
  }
});

router.post("/", (req, res, next) => {
  let activity = new Activity(req.body);
  activity
    .save()
    .then(activity => {
      res.redirect("/activities/new");
    })
    .catch(e => console.log(e));
});

module.exports = router;
