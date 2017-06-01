var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var challengeSchema = new Schema({
	name: {
		type: String,
		required: true
	},
	date: {
		start: {
			type: Date,
			required: true
		},
		end: {
			type: Date,
			required: true
		},
		registration_start: {
			type: Date,
			required: true,
			default: new Date()
		},
		registration_end: {
			type: Date,
			required: true
		}
	},
	winner: {
		type: Schema.Types.ObjectId,
		ref: 'Family',
		default: null
	}
});

challengeSchema.statics.getCurrentChallenge = function() {
	return Challenge.find().where('date.start').lt(new Date()).where('date.end').gt(new Date());
}

challengeSchema.statics.getPastChallenges = function() {
	return Challenge.find().populate('winner').where('date.end').lt(new Date());
}

challengeSchema.statics.getFutureChallenges = function() {
	return Challenge.find().where('date.start').gt(new Date());
}

challengeSchema.statics.getAllExceptPastChallenges = function() {
	return Challenge.find().where('date.end').lt(new Date()).count();
}

var Challenge = mongoose.model('Challenge', challengeSchema);

module.exports = Challenge;

