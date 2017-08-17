// Modules
var _ = require("lodash");

// Models
var User = require("./../models/user"),
  Challenge = require("./../models/challenge");

// middleware to check if the user is logged in
function verifyAuthorization(req, res, next) {
  console.log("req.session", req.session);
  // if x-auth key doesn't exist in session object
  //  render the 404 view (meaning they are not logged in)
  // else
  //  verify the JWT and find the user associated with the JWT
  var exemptPaths = ["/login", "/register"];
  if (_.includes(exemptPaths, req.path)) {
    next();
  } else {
    if (!req.session["x-auth"]) {
      if (req.path == "/") {
        next();
      } else {
        res.render("sessions/unauthorized");
      }
    } else {
      res.locals.token = req.session["x-auth"];
      User.decodeAuthorizationToken(res.locals.token)
        .then(user => {
          if (!user) res.status(404).send("UNAUTHORIZED.");
          res.locals.home = "/families/" + user.family.name;
          if (req.path == "/") res.redirect(res.locals.home);
          res.locals.loggedIn = true; //actually don't need this; can just check for user
          res.locals.user = user;
          return user.getRegisterableChallengesCount();
        })
        .then(challengeCount => {
          res.locals.challengeCount = challengeCount;
          return Challenge.getCurrentChallenge();
        })
        .then(currentChallenge => {
          res.locals.currentChallenge = currentChallenge;
          next();
        })
        .catch(e => console.log(e));
    }
  }
}

module.exports = verifyAuthorization;
