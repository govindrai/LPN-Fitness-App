// Modules
var _ = require("lodash");

// Models
var User = require("./../models/user"),
  Challenge = require("./../models/challenge");

// middleware to check if the user is logged in
function verifyAuthorization(req, res, next) {
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
          if (!user) return res.status(404).send("UNAUTHORIZED.");
          res.locals.familyColors = {
            Topaz: "#f2cd46",
            Sunstone: "#faa152",
            Ruby: "#f83b54",
            Alexandrite: "#cb51d7",
            Iolite: "#6456f8",
            Sapphire: "#3b8df8",
            Emerald: "#24ab60",
            Bye: "brown"
          };
          res.locals.statusColors = {
            winning: "#0b8c0b",
            losing: "#d92b3a",
            tied: "brown"
          };
          res.locals.home = "/families/" + user.family.name;
          if (req.path == "/") return res.redirect(res.locals.home);
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
