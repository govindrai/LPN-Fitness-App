const express = require('express');
const { addAsync } = require('@awaitjs/express');
const Participant = require('./../models/participant');

const router = addAsync(express.Router());

router.postAsync('/', async (req, res) => {
  await new Participant({
    user: res.locals.user._id,
    challenge: req.body._id,
  }).save();
  return res.sendStatus(200);
});

module.exports = router;
