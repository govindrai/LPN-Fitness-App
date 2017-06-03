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

participationSchema.statics.getParticipation = function(user, challenges) {
  return Promise.all(challenges.map(challenge => {
    return Participation.findOne({user, challenge}).then(result => {
      if (result) challenge.participation = true;
    });
  }));
}

participationSchema.statics.getParticipantsByFamily = function(challengeId, familyId) {
  return Participation.find({challenge: challengeId}).populate('user').where({'user.family': familyId});
}

var Participation = mongoose.model('Participations', participationSchema);

module.exports = Participation;