const mongoose = require('mongoose');

var familySchema = new mongoose.Schema({
	name: {
		type: String,
		required: true
	},
	motto: {
		type: String
	},
	challengesWon: {
		type: Number,
		default: 0
	}
});

var Family = mongoose.model('Family', familySchema);

module.exports = Family;