var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var participationSchema = new Schema({
  challenge: {
    type: Schema.Types.ObjectId,
    ref: 'Challenge',
    required: true
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true

  }
});

// participationSchema.statics.getParticipation = function(user, challenges) {
//   return new Promise((resolve, reject) => {
//     challengesArray = [];
//     challenges.forEach((challenge) => {
//       Participation.findOne({user, challenge})
//       .then((res) => {
//         // console.log("RESULT", res);
//         if (res) {
//           var leanObj = challenge.toObject();
//           // console.log("LEAN OBJ", leanObj);
//           leanObj.participation = true;
//           challengesArray.push(leanObj);
//         }
//       })
//       .catch(e => reject(e));
//     })
//     // Challenges Array empty :(
//     console.log("CHALLENGES ARRAY", challengesArray);
//     resolve(challengesArray);
//   });
// }

participationSchema.statics.getParticipation = function(user, challenges) {
  return Promise.all(challenges.map(challenge => {
    return Participation.findOne({user, challenge}).then(result => {
      if (result) challenge.participation = true;
    });
  }));
}

var Participation = mongoose.model('Participations', participationSchema);

module.exports = Participation;