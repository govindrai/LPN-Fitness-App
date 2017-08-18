// Models
const Challenge = require("./../models/challenge");

module.exports = function setLocals(res, res, next) {
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
  user
    .getRegisterableChallengesCount()
    .then(challengeCount => {
      res.locals.challengeCount = challengeCount;
      return Challenge.getCurrentChallenge();
    })
    .then(currentChallenge => {
      res.locals.currentChallenge = currentChallenge;
      next();
    });
};
