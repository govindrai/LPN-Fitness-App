const express = require("express");

const Participation = require("./../models/participation");

const router = express.Router();

router.post("/", (req, res) => {
  new Participation({
    user: res.locals.user._id,
    challenge: req.body._id
  })
    .save()
    .then(participation => res.sendStatus(200))
    .catch(e => res.status(400).send(e));
});

module.exports = router;
