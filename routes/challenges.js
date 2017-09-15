// Modules
const express = require("express"),
  _ = require("lodash");

// Models
const Challenge = require("./../models/challenge"),
  Family = require("./../models/family"),
  Participation = require("./../models/participation"),
  User = require("./../models/user"),
  Point = require("./../models/point");

// Middleware
const isAdmin = require("./../middleware/isAdmin");

const router = express.Router();

// GET list all challenges
router.get("/", (req, res) => {
  let futureChallenges,
    pastChallenges,
    currentChallenge = [res.locals.currentChallenge];
  Participation.setUserParticipationForChallenges(
    res.locals.user,
    currentChallenge
  )
    .then(() => {
      return Challenge.getFutureChallenges();
    })
    .then(challenges => {
      futureChallenges = challenges;
      return Participation.setUserParticipationForChallenges(
        res.locals.user,
        futureChallenges
      );
    })
    .then(() => {
      return Challenge.getPastChallenges();
    })
    .then(challenges => {
      pastChallenges = challenges;
      return Participation.setUserParticipationForChallenges(
        res.locals.user,
        pastChallenges
      );
    })
    .then(() => {
      const allChallenges = currentChallenge.concat(
        futureChallenges,
        pastChallenges
      );
      return Promise.all(
        allChallenges.map(challenge => challenge.getParticipantCount())
      );
    })
    .then(() =>
      res.render("challenges/index", {
        futureChallenges,
        pastChallenges
      })
    )
    .catch(e => console.log(e));
});

// Create Challenge Form
router.get("/new", isAdmin, (req, res) => {
  Challenge.findOne()
    .sort("-date.end")
    .select("date.end")
    .limit(1)
    .then(challenge => {
      let minDate = new Date(challenge.date.end);
      minDate.setDate(minDate.getDate() + 1);
      res.render("challenges/new", {
        challenge: new Challenge(),
        minDate
      });
    })
    .catch(e => console.log(e));
});

// Create Challenge
router.post("/", (req, res) => {
  const challenge = new Challenge({
    name: req.body.name,
    "date.start": req.body["date.start"],
    "date.end": req.body["date.end"]
  });
  challenge
    .save()
    .then(() => res.redirect("/challenges?created=true"))
    .catch(e => {
      if (e.name === "ValidationError") {
        return res.render("challenges/new", { errors: e.errors, challenge });
      }
      return console.log(e);
    });
});

// get edit challenge form
router.get("/:id/edit", isAdmin, (req, res) => {
  Challenge.findById(req.params.id).then(challenge => {
    res.render("challenges/edit", { challenge });
  });
});

// Delete challenge
router.delete("/:id", (req, res) => {
  let participations;
  let users = [];
  let points = [];
  Challenge.remove({ _id: req.params.id })
    .then(() => {
      return Participation.find({ challenge: req.params.id });
    })
    .then(participationsArray => {
      participations = participationsArray;
      return Participation.remove({ challenge: req.params.id });
    })
    .then(() => {
      return Promise.all(
        participations.map(participation => Point.find({ participation }))
      );
    })
    .then(pointsArraysArray => {
      const pointsToDecrementArray = [];
      pointsArraysArray.forEach(pointsArray => {
        pointsToDecrementArray.push(
          pointsArray.reduce((total, point) => {
            return (total += point.calculatedPoints);
          }, 0)
        );
      });
      console.log("Still ahve access to participations?", participations);
      const decrementLifeTimePointPromises = participations.map(
        (participation, index) => {
          return User.findById(participation.user).then(user => {
            user.update({
              $inc: { lifetimePoints: pointsToDecrementArray[index] * -1 }
            });
          });
        }
      );

      return Promise.all(decrementLifeTimePointPromises);
    })
    .then(() => {
      const participationIds = participations.map(
        participation => participation._id
      );
      return Point.remove({ _id: { $in: participationIds } });
    })
    .then(() => res.redirect("/challenges"))
    .catch(e => console.log(e));
});

// Edit Challenge
router.put("/:id", isAdmin, (req, res) => {
  const body = _.pick(req.body, ["name", "date.start", "date.end"]);
  let challenge;

  Challenge.findById(req.params.id)
    .then(oldChallenge => {
      challenge = oldChallenge;
      const datesNotModified =
        oldChallenge.date.start.toLocaleDateString() ===
        new Date(body["date.start"]).toLocaleDateString();
      if (datesNotModified) {
        delete body["date.start"];
        delete body["date.end"];
      }
    })
    .then(() => {
      Challenge.findOneAndUpdate(
        { _id: challenge._id },
        { $set: body },
        { new: true, runValidators: true }
      )
        .then(doc => {
          res.redirect("/challenges");
        })
        .catch(e => console.log(e));
    });
});

module.exports = router;
