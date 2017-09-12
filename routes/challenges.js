// Modules
const express = require("express"),
  _ = require("lodash");

// Models
const Challenge = require("./../models/challenge"),
  Family = require("./../models/family"),
  Participation = require("./../models/participation");

// Middleware
const isAdmin = require("./../middleware/isAdmin");

const router = express.Router();

// GET list all challenges
router.get("/", (req, res) => {
  let futureChallenges, pastChallenges;
  Participation.setUserParticipationForChallenges(res.locals.user, [
    res.locals.currentChallenge
  ])
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
  res.render("challenges/new");
});

// Create Challenge
router.post("/", (req, res) => {
  var body = _.pick(req.body, ["name", "date.start", "date.end"]);
  var challenge = new Challenge(body);
  challenge
    .save()
    .then(() => {
      res.redirect("/challenges");
    })
    .catch(e => {
      if (e.name === "ValidationError") {
        return res.render("challenges/new", { errors: e.errors });
      }
      return console.log(e);
    });
});

module.exports = router;
