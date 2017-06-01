var User = require('./../models/user'),
  Challenge = require('./../models/challenge');

function verifyAuthorization(req, res, next) {
  if (!req.session["x-auth"]) {
    next();
  } else {
    User.verifyAuthorizationToken(req.session["x-auth"])
    .then((user) => {
      if (!user) {
        res.status(404).send('UNAUTHORIZED.')
      }
      res.locals.loggedIn = true;
      res.locals.user = user;
      return Challenge.getAllExceptPastChallenges();
    })
    .then((challengeCount) => {
      console.log(challengeCount);
      res.locals.challengeCount = challengeCount;
      next();
    })
    .catch((e) => console.log(e));
  }
}

module.exports = verifyAuthorization;