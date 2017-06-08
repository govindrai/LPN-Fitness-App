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
		registrationStart: {
			type: Date,
			required: true,
			default: new Date()
		},
		registrationEnd: {
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

challengeSchema.pre('validate', function(next) {
	this.date.registrationEnd = this.date.start;
	next();
})

challengeSchema.statics.getCurrentChallenge = function() {
	return Challenge.findOne().where('date.start').lt(new Date()).where('date.end').gt(new Date());
}

challengeSchema.statics.getPastChallenges = function() {
	return Challenge.find().populate('winner').where('date.end').lt(new Date()).sort('date.start');
}

challengeSchema.statics.getFutureChallenges = function() {
	return Challenge.find().where('date.start').gt(new Date()).sort('date.start');
}

challengeSchema.statics.getAllExceptPastChallenges = function() {
	return Challenge.find().where('date.end').gt(new Date()).count();
}

challengeSchema.statics.getChallengeByDate = function(date) {
	return Challenge.find().where('date.start').lt(new Date(date)).where('date.end').gt(new Date(date));
};


var Challenge = mongoose.model('Challenge', challengeSchema);

module.exports = Challenge;

