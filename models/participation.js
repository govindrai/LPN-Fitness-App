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

var Participation = mongoose.model('Participations', participationSchema);

module.exports = Participation;