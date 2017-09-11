// Modules
const express = require("express");

// Models
const Challenge = require("./../models/challenge");

const router = express.Router();

// GET list all activities
router.get("/", (req, res) => {
  res.render("standings/index", {
    standings: res.locals.currentChallenge.getStandings()
  });
});

module.exports = router;
