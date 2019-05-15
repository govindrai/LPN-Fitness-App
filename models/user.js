const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const keys = require('../config/keys');
// const Challenge = require('./challenge');
const Participant = require('./participant');
// const Point = require('./point');

const logger = require('../utils/logger');

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
        validator: validator.isEmail,
        message: 'Please provide a valid email address.',
      },
      {
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

userSchema.post('validate', async function postValidateHook() {
  if (this.isModified('password')) {
    const hash = await mongoose.model('User').hashPassword(this.password);
    this.password = hash;
  }
});

userSchema.pre('save', async function preSaveHook() {
  const hash = await mongoose.model('User').hashPassword(this.password);
  this.password = hash;
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

userSchema.methods.getRanks = async function getRank() {
  const users = await mongoose
    .model('User')
    .find()
    .select('name lifetimePoints family')
    .sort('-lifetimePoints');

  // calculate the individual's overall rank
  const overallIndividualRank = calculateRank(users, this);

  // calculate the individual's overall rank in the family
  const familyMembers = users.filter(user => user.family.equals(this.family._id));
  const overallIndividualRankInFamily = calculateRank(familyMembers, this);

  return {
    overallIndividualRank,
    overallIndividualRankInFamily,
  };
};

function calculateRank(users, userNeedingRanking) {
  let totalRanks = 0;
  let userRank;
  let previousScore = Infinity;
  for (let i = 1; i <= users.length; i += 1) {
    const user = users[i - 1];
    if (user.lifetimePoints < previousScore) {
      totalRanks += 1;
    }

    if (user.fullName === userNeedingRanking.fullName) {
      userRank = totalRanks;
    }
    previousScore = user.lifetimePoints;
  }
  return userRank;
}

// Verifies authorization token and returns a user
userSchema.statics.decodeAuthorizationToken = async function (token) {
  const decoded = await new Promise((resolve, reject) => {
    jwt.verify(token, keys.JWT_SECRET, (err, decoded) => {
      if (err) reject(err);
      resolve(decoded);
    });
  }).then(decoded => mongoose.model('User').findOne({
    _id: decoded._id,
    'tokens.token': token,
    'tokens.access': decoded.access,
  }).populate('family'));
};

userSchema.statics.destroyAuthorizationToken = token => userSchema.statics.decodeAuthorizationToken(token);

userSchema.methods.authenticate = function (password) {
  logger.log('info:model:User:authenticate');
  return bcrypt.compare(password, this.password);
};

userSchema.statics.getAdmins = function () {
  return mongoose.model('User').find({ admin: true })
    .populate('family')
    .then(admins => admins.sort((a, b) => (a.name.last < b.name.last ? -1 : 1)));
};

userSchema.statics.getNonAdmins = function () {
  return mongoose.model('User').find({ admin: false })
    .populate('family')
    .then(nonAdmins => nonAdmins.sort((a, b) => (a.name.last < b.name.last ? -1 : 1)));
};

// return the number of challenges a user is eligible to register for
userSchema.methods.getRegisterableChallengesCount = async function (futureChallenges) {
  await Promise.all(futureChallenges.map(this.setIsParticipantFlagOnChallenge.bind(this)));
  return futureChallenges.filter(challenge => !challenge.isParticipant).length;
};

function isExistingEmail(email, cb = null) {
  return mongoose
    .model('User')
    .findOne({ email })
    .then(existingUser => {
      if (cb) {
        return cb(!existingUser, 'Email address is already in use.');
      }
      return !existingUser;
    });
}

userSchema.methods.setIsParticipantFlagOnChallenge = async function (challenge) {
  const participant = await Participant.findOne({ challenge: challenge._id, user: this._id });
  challenge.isParticipant = !!participant;
};

userSchema.virtual('fullName').get(function () {
  return `${this.name.first} ${this.name.last}`;
});

const User = mongoose.model('User', userSchema);

module.exports = User;
