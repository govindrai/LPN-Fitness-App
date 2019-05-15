const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema({
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

participantSchema.statics = {
  // returns participant objs for a certain challenge and family
  // TODO: can probably get this right when the app loads and get data for all families right off the bat
  async getChallengeParticipantsByFamily(challengeId, familyId) {
    const participants = await mongoose
      .model('Participant')
      .find({ challenge: challengeId })
      .populate('user');
    return participants.filter(participant => participant.user.family.equals(familyId));
  },
};

participantSchema.methods = {
  // adds isParticipant attribute set to true to challenge objects if user is participating in those challenges
  async setIsParticipantFlagOnChallenge(challenge) {
    const participant = await mongoose.model('Participant').findOne({ user: this, challenge });
    challenge.isParticipant = !!participant;
  },
};

const Participant = mongoose.model('Participant', participantSchema);

module.exports = Participant;
