const mongoose = require('mongoose'); 
// might need to change to 'db/mongoose'
const validator = require('validator'); 

var familySchema = new mongoose.Schema({
	name: {
		type: String, 
		required: true
	}, 
	motto: {
		type: String, 
		required: true 
	}, 
	challengesWon: {
		type: Number,
		default: 0
	}
});

var Family = mongoose.model('Family', familySchema);

module.exports = {Family}; 