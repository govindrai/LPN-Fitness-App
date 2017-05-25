const mongoose = require('mongoose'); 
// might need to change to 'db/mongoose'
const validator = require('validator'); 

var activitySchema = new mongoose.Schema({
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
	unit: {
		type: [{Schema.Types.ObjectId, ref: 'Unit'}]
	}
});

var Activity = mongoose.model('Activity', activitySchema); 

module.exports = {Activity};