const mongoose = require('mongoose').set('debug', true); 
const {Unit} = require('./../models/unit');
var Schema = mongoose.Schema;
var {ObjectId} = mongoose.Types

var activitySchema = new Schema({
	name: {
		type: String, 
		required: true
	},
	description: {
		type: String,
		required: true
	},
	pointsPerUnit: {
		type: Number,
		required: true
	},
	unit_id: {
		type: Schema.Types.ObjectId, 
		ref: 'Unit'
	}
});

activitySchema.methods.getUnitName = function() {
	Unit.findById(this.unit_id).then((unit) => {
		return unit
	}).catch((e) => {
		console.log("THERE WAS AN ERROR")
		console.log(e)
	});
}

var Activity = mongoose.model('Activity', activitySchema); 

module.exports = {Activity};