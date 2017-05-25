const mongoose = require('mongoose'); 
// might need to change to 'db/mongoose'
const validator = require('validator'); 

var userSchema = new mongoose.Schema({
	name: {
		first: {
			type: String,
			required: true
		},
		last: {
			type: String, 
			required: true
		}
	},
	email: {
		type: String,
		required: true,
		validate: validator.isEmail
	},
	family: {
		type: [{Schema.Types.ObjectId, ref: 'Family'}]
	}
})
