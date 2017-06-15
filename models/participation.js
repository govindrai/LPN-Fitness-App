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

// add a participation attribute set to true for challenge objects
// if user participates in challenges
participationSchema.statics.getParticipation = function(user, challenges) {
  return Promise.all(challenges.map(challenge => {
    return Participation.findOne({user, challenge}).then(result => {
      if (result) challenge.participation = true;
    });
  }));
};

// returns participation objs for a certain challenge and family
participationSchema.statics.getParticipationByFamily = function(challengeId, familyId) {
  return Participation.find({challenge: challengeId}).populate('user')
  .then(participations => {
    return participations.filter(participation => {
      return participation.user.family.toString() == familyId.toString();
    })
  })
}

var Participation = mongoose.model('Participations', participationSchema);

module.exports = Participation;