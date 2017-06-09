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
        res.status(404).send('UNAUTHORIZED.');
      }
      res.locals.loggedIn = true;
      res.locals.user = user;
      res.locals.home = '/families/' + user.family.name;
      return Challenge.getAllExceptPastChallenges();
    })
    .then(challengeCount => {
      res.locals.challengeCount = challengeCount;
      return Challenge.getCurrentChallenge();
    })
    .then(currentChallenge => {
      res.locals.currentChallenge = currentChallenge;
      next();
    })
    .catch((e) => console.log(e));
  }
}

module.exports = verifyAuthorization;