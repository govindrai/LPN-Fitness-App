Challenge = require('./../models/challenge');

function getChallengesCount(req, res, next) {
  return new Promise((resolve, reject) => {
    Challenge.count({}, (err, count) {
      if (err) {
        reject(err);
      }
      resolve(count);
    })
  })
  .then(count => {
    res.locals.challengesCount = count
    next();
  })
  .catch(err => console.log(err));
}

module.exports = getChallengesCount

