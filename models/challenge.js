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

var Challenge = mongoose.model('Challenge', challengeSchema);

module.exports = Challenge;

