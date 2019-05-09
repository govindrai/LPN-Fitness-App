const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const Challenge = require('./challenge');
const Participant = require('./participant');

const userSchema = new mongoose.Schema({
  name: {
    first: {
      type: String,
      required: true,
      trim: true,
    },
    last: {
      type: String,
      required: true,
      trim: true,
    },
    nickname: {
      type: String,
      trim: true,
      default: null,
    },
  },
  email: {
    type: String,
    required: [true, 'Email is required.'],
    trim: true,
    validate: [
      {
        isAsync: true,
        validator: validator.isEmail,
        message: 'Please provide a valid email address.',
      },
      {
        isAsync: true,
        validator: isExistingEmail,
      },
    ],
  },
  password: {
    type: String,
    required: true,
    minlength: [6, 'Passwords must be at least 6 characters long.'],
  },
  family: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Family',
    required: true,
  },
  lifetimePoints: {
    type: Number,
    default: 0,
  },
  admin: {
    type: Boolean,
    default: false,
  },
  tokens: [
    {
      _id: false,
      access: {
        type: String,
        required: true,
      },
      token: {
        type: String,
        required: true,
      },
    },
  ],
});

userSchema.post('validate', function (doc) {
  const user = this;
  if (user.isModified('password')) {
    User.hashPassword(user.password)
      .then(hash => {
        user.password = hash;
      })
      .catch(e => console.log(e));
  }
});

userSchema.pre('save', function (done) {
  const user = this;
  User.hashPassword(user.password)
    .then(hash => {
      user.password = hash;
      done();
    })
    .catch(e => {
      console.log(e);
      done(e);
    });
});

userSchema.statics = {
  hashPassword(password) {
    return bcrypt.hash(password, 10);
  },
};

userSchema.methods.generateAuthorizationToken = function () {
  const user = this;
  return new Promise((resolve, reject) => {
    const payload = { _id: user._id, access: 'auth' };
    jwt.sign(payload, process.env.JWT_SECRET || 'secret', (err, token) => {
      if (err) reject(err);
      resolve(token);
    });
  }).then(token => {
    user.tokens.push({ access: 'auth', token });
    return user.update({ $set: { tokens: user.tokens } });
  });
};

// Verifies authorization token and returns a user
userSchema.statics.decodeAuthorizationToken = function (token) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.JWT_SECRET || 'secret', (err, decoded) => {
      if (err) reject(err);
      resolve(decoded);
    });
  }).then(decoded => User.findOne({
      _id: decoded._id,
      'tokens.token': token,
      'tokens.access': decoded.access,
    }).populate('family'),);
};

userSchema.statics.destroyAuthorizationToken = token => userSchema.statics.decodeAuthorizationToken(token);

userSchema.methods.authenticate = function (password) {
  return bcrypt.compare(password, this.password);
};

userSchema.statics.getAdmins = function () {
  return User.find({ admin: true })
    .populate('family')
    .then(admins => admins.sort((a, b) => (a.name.last < b.name.last ? -1 : 1)));
};

userSchema.statics.getNonAdmins = function () {
  return User.find({ admin: false })
    .populate('family')
    .then(nonAdmins => nonAdmins.sort((a, b) => (a.name.last < b.name.last ? -1 : 1)));
};

// return the number of challenges a user is eligible to register for
userSchema.methods.getRegisterableChallengesCount = async function () {
  let challengesArray;
  const futureChallenges = await Challenge.getFutureChallenges();
  await Promise.all(futureChallenges.map(this.setParticipantFlagOnChallenge.bind(this)));
  return futureChallenges.filter(challenge => !challenge.isParticipant).length;
};

function isExistingEmail(email, cb = null) {
  return User.findOne({ email }).then(existingUser => {
    if (cb) {
      return cb(!existingUser, 'Email address is already in use.');
    }
    return !existingUser;
  });
}

userSchema.methods.setParticipantFlagOnChallenge = async function (challenge) {
  const participant = await Participant.findOne({ challenge: challenge._id, user: this._id });
  challenge.isParticipant = !!participant;
};

userSchema.virtual('fullName').get(function () {
  return `${this.name.first} ${this.name.last}`;
});

const User = mongoose.model('User', userSchema);

module.exports = User;
