const mongoose = require('mongoose'); 
// might need to change to 'db/mongoose'
const validator = require('validator'); 
const jwt = require('jsonwebtoken'); 
var Schema = mongoose.Schema; 

var userSchema = new Schema({
	name: {
		first: {
			type: String,
			required: true,
			trim: true
		},
		last: {
			type: String, 
			required: true,
			trim: true
		}, 
		nickname: {
			type: String, 
			minLength: 3,
			trim: true
		}
	},
	email: {
		type: String,
		required: true,
		trim: true,
		validate: validator.isEmail
	},
	password: {
		type: String,
		minLength: 6
	}
	family: {
		type: Schema.Types.ObjectId,
		ref: 'Family'
	},
	allTimePoints: {
		type: Number,
		default: 0
	},
	admin: {
		type: Boolean,
		default: false
	},
	tokens:[{
		access: {
			type: String,
			required: true
		},
		token: {
			type: String,
			required: true
		}
	}]
}); 

userSchema.statics.getAdmins = function () {
	return User.find({admin: true}).populate('family'); 
}; 

userSchema.statics.getNonAdmins = function () {
	return User.find({admin: false}).populate('family');
};

var User = mongoose.model('User', userSchema);

module.exports = {User}; 