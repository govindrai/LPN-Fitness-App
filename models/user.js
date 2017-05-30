const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
var Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');

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
		unique: true,
		validate: validator.isEmail
	},
	password: {
		type: String,
		required: true
	},
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
	tokens: [{
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

userSchema.pre('save', function(next) {
	var user = this;
	if (user.isModified('password')) {
		bcrypt.genSalt(10, (err, salt) => {
			if (err) {
				console.log(err);
			}
			bcrypt.hash(user.password, salt, (error, hash) => {
				if (error) {
					console.log(err);
				}
				user.password = hash;
				next();
			});
		});
	} else {
		next();
	}
});

userSchema.methods.generateAuthToken = function() {
	var user = this;
	var payload = {
		_id: this._id,
		access: "auth"
	};

	return new Promise((resolve, reject) => {
		jwt.sign(payload, 'secret', (err, token) => {
			if (err) {
				reject(err);
			}
				resolve(token);
		});
	})
}

userSchema.statics.authenticate = function(email, password) {
  var user = this;
  return new Promise((resolve, reject) => {
    bcrypt.compare(password, user.hash, (err, res) => {
      resolve();
    }).then(() => {
      return User.findOne({email, password});
    });
  })
}

userSchema.statics.getAdmins = function () {
	return User.find({admin: true}).populate('family');
};

userSchema.statics.getNonAdmins = function () {
	return User.find({admin: false}).populate('family');
};

var User = mongoose.model('User', userSchema);

module.exports = {User};