const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const Participant = require('./participant');
const Point = require('./point');

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
        msg: 'Please provide a valid email address.',
      },
      {
        validator: isExistingEmail,
        msg: 'Email address is already in use, please try with a different email address.',
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

userSchema.pre('save', async function preSaveHook() {
  logger.info('model:User:presaveHook', 'Entered presaveHook');
  await this.hashPassword();
  return this.generateAccessTokens();
});

userSchema.post('save', async function postSaveHook() {
  logger.info('model:User:postsaveHook', 'Entered postSaveHook');
  await this.populate('family');
});

userSchema.pre('findOne', function preFindOneHook() {
  logger.info('model:User:preFindOne', 'entered preFindOneHook');
  this.populate('family');
});

userSchema.statics = {
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

  // TODO: this should be a server side aggregation
  async getUsersByRank(familyId) {
    logger.info('model:User:getUsersByRank', 'Entered getUsersByRank');
    const users = await mongoose
    .model('User')
    .find()
    .select('name lifetimePoints family')
    .sort('-lifetimePoints');

    // calculate the individual's overall rank
    rankUsers(users, 'overallIndividualRank');

    // calculate the individual's overall rank in the family
    const familyMembers = users.filter(user => user.family.equals(familyId));
    rankUsers(familyMembers, 'overallIndividualRankInFamily');

    return users;
  },

  getAllTimeIndividualRankings,
};

userSchema.methods = {
  // returns a promise
  async hashPassword() {
    logger.info('model:User:hashPassword', 'Entered hashPassword');
    this.password = await bcrypt.hash(this.password, 10);
  },

  async generateAccessTokens() {
    logger.info('model:User:generateAccessTokens', 'Entered generateAccessTokens');
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
    if (!this.isNew) {
      await this.updateOne({
        accessToken: tokens[0],
        refreshToken: tokens[1],
      });
    } else {
      [this.accessToken, this.refreshToken] = tokens;
    }
    return tokens;
  },

  async getRankedUser() {
    logger.info('model:User:getRankedUser', 'Entered getRankedUser');
    const rankedUsers = await mongoose.model('User')
    .getUsersByRank(this.family._id);
    return rankedUsers.find(user => user._id.equals(this._id));
  },

  // returns a promise
  authenticate(password) {
    logger.info('model:User:authenticate', 'Entered authenticate');
    return bcrypt.compare(password, this.password);
  },

  // return the number of challenges a user is eligible to register for
  async getRegisterableChallengesCount(futureChallenges) {
    logger.info('model:User:getRegisterableChallengesCount', 'Entered getRegisterableChallengesCount');
    await Promise.all(futureChallenges.map(this.setIsParticipantFlagOnChallenge.bind(this)));
    return futureChallenges.filter(challenge => !challenge.isParticipant).length;
  },

  async setIsParticipantFlagOnChallenge(challenge) {
    logger.info('model:User:setIsParticipantFlagOnChallenge', 'Entered setIsParticipantFlagOnChallenge');
    const participant = await Participant.findOne({
      challenge: challenge._id,
      user: this._id,
    });
    challenge.isParticipant = !!participant;
  },

  // returns the total amount of times a user participated in a challenge
  // TODO: write unit test for this
  async getNumOfChallengesCompleted(currentChallenge) {
    logger.info('model:User:getNumOfChallengesCompleted');
    const participants = await Participant.find({ user: this._id });
    if (currentChallenge) {
      const isParticipantInCurrentChallenge = participants.find(partipant => !partipant.challenge.equals(currentChallenge._id));
      this.$locals.numOfChallengesCompleted = isParticipantInCurrentChallenge ? participants.length - 1 : participants.length;
    }
    this.$locals.numOfChallengesCompleted = participants.length;
  },

  // TODO: Put in points in the app. then run aggregations in mongodb compass
  async getFavoriteActivity() {
    logger.entered('model:User:getFavoriteActivity');
    const res = await Point.aggregate([
      {
        $match: {
          user: this._id,
        },
      }, {
        $lookup: {
          from: 'activities',
          localField: 'activity',
          foreignField: '_id',
          as: 'activity',
        },
      }, {
        $unwind: {
          path: '$activity',
        },
      }, {
        $project: {
          _id: 0,
          calculatedPoints: 1,
          activity: '$activity.name',
        },
      }, {
        $group: {
          _id: '$activity',
          count: {
            $sum: 1,
          },
          totalPointsForActivity: {
            $sum: '$calculatedPoints',
          },
        },
      },
      {
        $sort: {
          totalPointsForActivity: -1,
        },
      }, {
        $limit: 1,
      }]);
    return res[0];
  },
};

userSchema.virtual('fullName')
.get(function getFullName() {
  logger.entered('model:User:virtual:getFullName');
  return `${this.name.first} ${this.name.last}`;
});

const User = mongoose.model('User', userSchema);

module.exports = User;

// Mongoose Validators

async function isExistingEmail(email) {
  logger.entered('model:User:validator:isExistingEmail');
  const existingUser = await mongoose.model('User')
  .findOne({ email });
  return !existingUser;
}

// Helpers

function signPayload(payload) {
  logger.entered('model:User:helper:signPayload');
  return new Promise((resolve, reject) => {
    jwt.sign(payload, process.env.JWT_SECRET || 'secret', (err, token) => {
      if (err) reject(err);
      resolve(token);
    });
  });
}

function rankUsers(users, rankLabel) {
  logger.entered('model:User:helper:rankUsers');
  let currentRank = 0;
  let previousScore = Infinity;

  for (let i = 1; i <= users.length; i += 1) {
    const user = users[i - 1];
    if (user.lifetimePoints < previousScore) {
      currentRank += 1;
      previousScore = user.lifetimePoints;
    }
    user.$locals[rankLabel] = currentRank;
  }
}

// Statistics Methods

// gets the entire fraternity's individual rankings for all time
function getAllTimeIndividualRankings() {
  logger.entered('model:User:helper:getAllTimeIndividualRankings');
  return mongoose
  .model('User')
  .find()
  .select('name lifeTimePoints')
  .sort('-lifetimePoints');
}
