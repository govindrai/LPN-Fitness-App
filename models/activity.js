const mongoose = require('mongoose').set('debug', true);
const Unit = require('./../models/unit');
var Schema = mongoose.Schema;
var {ObjectId} = mongoose.Types;

var activitySchema = new Schema({
	name: {
		type: String,
		unique: true,
		required: true
	},
	description: {
		type: String
	},
	points: {
		type: Number,
		required: true
	},
	scale: {
		type: Number,
		required: true
	},
	unit: {
		type: Schema.Types.ObjectId,
		ref: 'Unit',
		required: true
	}
});

var Activity = mongoose.model('Activity', activitySchema);

module.exports = Activity;
