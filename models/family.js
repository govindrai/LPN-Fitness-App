var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var familySchema = new mongoose.Schema({
	name: {
		type: String,
		unique: true,
		required: true
	},
	motto: {
		type: String,
		required: true,
		default: "We are too cool for a motto."
	},
	challengesWon: {
		type: Number,
		default: 0
	},
	playoffsReached: {
		type: Number,
		default: 0
	},
	winner: {
		type: Boolean
	}
});

familySchema.methods.increaseChallengesWon = function() {
	this.challengesWon += 1;
	return this.save();
};

familySchema.methods.increasePlayoffsReached = function() {
	this.playoffsReached += 1;
	return this.save();
};

var Family = mongoose.model('Family', familySchema);

module.exports = Family;