// Modules
const express = require('express');

// Models
const Challenge = require('./../models/challenge');

const router = express.Router();

// GET list all activities
router.get('/', (req, res) => {
  res.locals.currentChallenge
    .getStandings()
    .then(standingsArray => res.render('standings/index', { standingsArray }))
    .catch(e => console.log('error in standings index', e));
});

module.exports = router;
