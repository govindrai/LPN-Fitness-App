var express = require('express'),
  _ = require('lodash');

var Participation = require('./../models/participation');

var router = express.Router();

router.post('/', (req, res) => {
  if (req.xhr) {
    var body = _.pick(req.body, ['_id']);
    var participation = new Participation({
      user: res.locals.user._id,
      challenge: body
    });
    participation
      .save()
      .then(() => {
        res.status(200).send('we added this participation');
      })
      .catch(e => res.status(400).send(e));
  } else {
    res.send('NOT AN XHR REQUEST');
  }
});

module.exports = router;
