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
  accessToken: String,
  refreshToken: String,
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

  // Verifies authorization token and returns a user
  async decodeAuthorizationToken(accessToken, refreshToken) {
    logger.log('info:model:User:decodeAuthorizationToken');
    const decodedJwt = await new Promise((resolve, reject) => {
      jwt.verify(accessToken, keys.JWT_SECRET, (err, decodedToken) => {
        // TODO: Need to check database for valid refreshtoken or not
        if (err) reject(err);
        resolve(decodedToken);
      });
    });
    return mongoose
      .model('User')
      .findById(decodedJwt.data.userId)
      .populate('family');
  },

  destroyAuthorizationToken(token) {
    return userSchema.statics.decodeAuthorizationToken(token);
  },

  getAdmins() {
    return mongoose
      .model('User')
      .find({ admin: true })
      .populate('family')
      .then(admins => admins.sort((a, b) => (a.name.last < b.name.last ? -1 : 1)));
  },

  getNonAdmins() {
    return mongoose
      .model('User')
      .find({ admin: false })
      .populate('family')
      .then(nonAdmins => nonAdmins.sort((a, b) => (a.name.last < b.name.last ? -1 : 1)));
  },
};

userSchema.methods = {
  async generateAccessTokens() {
    logger.log('info:model:User:generateAccessTokens');
    const accessTokenPayload = {
      type: 'access',
      data: {
        userId: this._id,
      },
      exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hour
    };

    const refreshTokenPayload = {
      type: 'refresh',
      data: {
        userId: this._id,
      },
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 90, // 90 days
    };

    const tokens = await Promise.all([signPayload(accessTokenPayload), signPayload(refreshTokenPayload)]);
    await this.updateOne({ accessToken: tokens[0], refreshToken: tokens[1] });
    return tokens;
  },

  async getRanks() {
    logger.log('info:model:User:getRanks');
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
  },

  authenticate(password) {
    logger.log('info:model:User:authenticate');
    return bcrypt.compare(password, this.password);
  },

  // return the number of challenges a user is eligible to register for
  async getRegisterableChallengesCount(futureChallenges) {
    logger.log('info:model:User:getRegisterableChallengesCount');
    await Promise.all(futureChallenges.map(this.setIsParticipantFlagOnChallenge.bind(this)));
    return futureChallenges.filter(challenge => !challenge.isParticipant).length;
  },

  async setIsParticipantFlagOnChallenge(challenge) {
    logger.log('info:model:User:setIsParticipantFlagOnChallenge');
    const participant = await Participant.findOne({ challenge: challenge._id, user: this._id });
    challenge.isParticipant = !!participant;
  },
};

userSchema.virtual('fullName').get(function getFullName() {
  logger.log('info:model:User:virtual:getFullName');
  return `${this.name.first} ${this.name.last}`;
});

const User = mongoose.model('User', userSchema);

module.exports = User;

// Helpers

function signPayload(payload) {
  return new Promise((resolve, reject) => {
    jwt.sign(payload, process.env.JWT_SECRET || 'secret', (err, token) => {
      if (err) reject(err);
      resolve(token);
    });
  });
}

function isExistingEmail(email, cb = null) {
  logger.log('info:model:User:isExistingEmail');
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
