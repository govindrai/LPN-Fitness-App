const mongoose = require('mongoose'); 
const Schema = mongoose.Schema;

var unitSchema = new Schema({
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