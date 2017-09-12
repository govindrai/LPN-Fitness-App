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

module.exports = router;
