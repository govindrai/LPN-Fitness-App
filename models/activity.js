const mongoose = require('mongoose').set('debug', true);
const Unit = require('./../models/unit');
var Schema = mongoose.Schema;
var {ObjectId} = mongoose.Types; 

var activitySchema = new Schema({
	name: {
		type: String,
		required: true
	},
	NumberOfPoints: {
		type: Number,
		required: true
	},
	scale: {
		type: Number, 
		required
	}, 
	unitId: {
		type: Schema.Types.ObjectId,
		ref: 'Unit'
	}
});

var Activity = mongoose.model('Activity', activitySchema);

module.exports = Activity;
