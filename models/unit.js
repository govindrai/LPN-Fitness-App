const mongoose = require('mongoose'); 
// might need to change to 'db/mongoose'
const validator = require('validator'); 

var unitSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true
	},
	abbreviation: {
		type: String, 
		required: true
	}
});

var Unit = mongoose.model('Unit', unitSchema);

module.exports = {Unit}; 