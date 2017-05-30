const mongoose = require('mongoose');

var familySchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
		unique: true
	},
	motto: {
		type: String
	},
	challengesWon: {
		type: Number,
		default: 0
	},
	playoffsReached: {
		type: Number,
		default: 0
	}
});

familySchema.methods.increaseChallengesWon = function() {
	var challenge = this;
	challenge.challengesWon += 1;
	return challenge.save();
}

familySchema.methods.increasePlayoffsReached = function() {
	var challenge = this;
	challenge.playoffsReached += 1;
	return challenge.save();
}

var Family = mongoose.model('Family', familySchema);

module.exports = Family;