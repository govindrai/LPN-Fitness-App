var User = require('./../models/user'),
  Challenge = require('./../models/challenge');

// Checks if the user is logged in
function verifyAuthorization(req, res, next) {
  if (!req.session["x-auth"]) {
    console.log("SESSION NOT FOUND");
    res.render('sessions/unauthorized');
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
      res.locals.challengeCount = challengeCount;
      next();
    })
    .catch((e) => console.log(e));
  }
}

module.exports = verifyAuthorization;