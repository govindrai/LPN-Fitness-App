const mongoose = require('mongoose');

const participationSchema = new mongoose.Schema({
  challenge: {
    type: mongoose.Types.ObjectId,
    ref: 'Challenge',
    required: true,
  },
  user: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
    required: true,
  },
});

// add a participation attribute set to true for challenge objects
// if user participates in challenges
participationSchema.statics.setUserParticipationForChallenges = function(user, challenges) {
  return Promise.all(
    challenges.map(challenge => {
      return Participation.findOne({ user, challenge }).then(result => {
        challenge.participation = !!result;
      });
    })
  );
};

// returns participation objs for a certain challenge and family
participationSchema.statics.getChallengeParticipantsByFamily = function(challengeId, familyId) {
  return Participation.find({ challenge: challengeId })
    .populate('user')
    .then(participations => {
      familyParticipants = participations.filter(participation => participation.user.family.toString() == familyId.toString());
      return familyParticipants;
    })
    .catch(e => console.log(e));
};

const Participation = mongoose.model('Participations', participationSchema);

module.exports = Participation;
