const mongoose = require('mongoose'); 
// might need to change to 'db/mongoose'
const validator = require('validator'); 

var scoreSchema = new mongoose.Schema({
	userId: {
		type: [{Schema.Types.ObjectId, ref: 'User'}],
		required: true
	},
	challengeId: {
		type: [{Schema.Types.ObjectId, ref: 'Challenge'}],
		required: true
	},
	activityId: {
		type: [{Schema.Types.ObjectId, ref: 'Activity'}],
		required: true
	},
	unitsExercised: {
		type: Number,
		required: true
	},
	points: {
		type: Number,
		required: true 
	}
});

var Score = mongoose.model('Score', scoreSchema);

module.exports = {Score}; 