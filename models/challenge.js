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

var Challenge = mongoose.model('Challenge', challengeSchema);

module.exports = Challenge;

