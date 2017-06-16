var mongoose = require('mongoose'),
	validator = require('validator'),
	jwt = require('jsonwebtoken'),
	bcrypt = require('bcryptjs');

var Schema = mongoose.Schema,
	Challenge = require('./challenge'),
	Participation = require('./participation');

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
			if (err) return console.log(err);
			bcrypt.hash(user.password, salt, (error, hash) => {
				if (error) return console.log(err);
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
	});
};

// Verifies authorization token and returns a user
userSchema.statics.decodeAuthorizationToken = function(token) {
	return new Promise((resolve, reject) => {
		jwt.verify(token, 'secret', (err, decoded) => {
			if (err) reject(err);
			resolve(decoded);
		});
	});
};

userSchema.statics.destroyAuthorizationToken = token => userSchema.statics.decodeAuthorizationToken(token);

userSchema.methods.authenticate = function(password) {
  var user = this;
  return new Promise((resolve, reject) => {
    bcrypt.compare(password, user.password, (err, res) => {
    	if (err) reject(err);
      resolve(res);
    });
  });
};

userSchema.statics.getAdmins = () => User.find({admin: true}).populate('family');

userSchema.statics.getNonAdmins = () => User.find({admin: false}).populate('family');

userSchema.statics.getFamilyMembers = familyId => User.find({familyId});

userSchema.methods.getRegisterableChallengesCount = function() {
	var user = this;
	var futureChallenges;
	return Challenge.getFutureChallenges()
	.then(challenges => {
		futureChallenges = challenges;
		return Participation.setUserParticipationForChallenges(user, futureChallenges);
	})
	.then(() => {
		return futureChallenges.reduce((total, challenge) => {
			return total += challenge.participation ? 0 : 1;
		}, 0);
	});
};

userSchema.virtual('fullName').get(function() {
	  return this.name.first + ' ' + this.name.last;
	});

var User = mongoose.model('User', userSchema);

module.exports = User;
