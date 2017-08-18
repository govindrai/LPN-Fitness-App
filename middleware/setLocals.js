// Models
const Challenge = require("./../models/challenge");

module.exports = function setLocals(req, res, next) {
  if (res.locals.user) {
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
      Winning: "#0b8c0b",
      Losing: "#d92b3a",
      Tied: "brown"
    };
    res.locals.user
      .getRegisterableChallengesCount()
      .then(challengeCount => {
        res.locals.challengeCount = challengeCount;
        return Challenge.getCurrentChallenge();
      })
      .then(currentChallenge => {
        res.locals.currentChallenge = currentChallenge;
        return next();
      });
  } else {
    return next();
  }
};
