const express = require("express");

const Participation = require("./../models/participation");

const router = express.Router();

router.post("/", (req, res) => {
  var participation = new Participation({
    user: res.locals.user._id,
    challenge: req.body._id
  });
  participation
    .save()
    .then(participation => {
      res.status(200).send("we added this participation");
    })
    .catch(e => res.status(400).send(e));
});

module.exports = router;
