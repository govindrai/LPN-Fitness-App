var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var pointSchema = new Schema({
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

var Point = mongoose.model('Point', pointSchema);

module.exports = Point;