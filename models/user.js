var mongoose = require('mongoose'),
	validator = require('validator'),
	jwt = require('jsonwebtoken'),
	bcrypt = require('bcryptjs');

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
			trim: true,
			default: null
		}
	},
	email: {
		type: String,
		required: [true, "Email is Required"],
		trim: true,
		unique: true,
		validate: {
			validator: validator.isEmail,
			message: 'Please provide a valid email!'
		}
	},
	password: {
		type: String,
		required: true
	},
	family: {
		type: Schema.Types.ObjectId,
		ref: 'Family'
	},
	lifetimePoints: {
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

userSchema.methods.generateAuthorizationToken = function() {
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
};

userSchema.statics.verifyAuthorizationToken = function(token) {
	return new Promise((resolve, reject) => {
		jwt.verify(token, 'secret', (err, decoded) => {
			if (err) {
				reject(err);
			}
			resolve(decoded);
		});
	}).then((decoded) => {
		return User.findOne({_id: decoded._id, 'tokens.token': token, 'tokens.access': decoded.access})
	}).catch((e) => console.log(e));
}

userSchema.statics.destroyAuthorizationToken = function(token) {
	return userSchema.statics.verifyAuthorizationToken(token);
}

userSchema.methods.authenticate = function(password) {
  var user = this;
  return new Promise((resolve, reject) => {
    bcrypt.compare(password, user.password, (err, res) => {
    	if (err) {
				console.log(err);
				console.log("THeRE IS AN ERROR")
    		reject(err);
    	}
      resolve(res);
    });
  });
};

userSchema.statics.extractUser = function(token) {
	return userSchema.statics.verifyAuthorizationToken(token);
}

userSchema.statics.getAdmins = function() {
	return User.find({admin: true}).populate('family');
};

userSchema.statics.getNonAdmins = function() {
	return User.find({admin: false}).populate('family');
};

userSchema.statics.getFamilyMembers = function(family_id) {
	return User.find({family_id})
}

userSchema.virtual('fullName').get(function() {
  return this.name.first + ' ' + this.name.last;
});

var User = mongoose.model('User', userSchema);

module.exports = User;
