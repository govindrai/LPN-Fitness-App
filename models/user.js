var mongoose = require("mongoose"),
  validator = require("validator"),
  jwt = require("jsonwebtoken"),
  bcrypt = require("bcryptjs");

var Schema = mongoose.Schema,
  Challenge = require("./challenge"),
  Participation = require("./participation");

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
      trim: true,
      default: null
    }
  },
  email: {
    type: String,
    required: [true, "Email is required."],
    trim: true,
    validate: [
      {
        isAsync: true,
        validator: validator.isEmail,
        message: "Please provide a valid email address."
      },
      {
        isAsync: true,
        validator: (email, cb) => {
          User.findOne({ email }).then(existingUser => {
            cb(!existingUser, "Email address already exists.");
          });
        }
      }
    ]
  },
  password: {
    type: String,
    required: true,
    minlength: [6, "Passwords must be at least 6 characters long."]
  },
  family: {
    type: Schema.Types.ObjectId,
    ref: "Family",
    required: true
  },
  lifetimePoints: {
    type: Number,
    default: 0
  },
  admin: {
    type: Boolean,
    default: false
  },
  tokens: [
    {
      _id: false,
      access: {
        type: String,
        required: true
      },
      token: {
        type: String,
        required: true
      }
    }
  ]
});

userSchema.pre("save", function(next) {
  var user = this;
  if (user.isModified("password")) {
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
  return new Promise((resolve, reject) => {
    var payload = { _id: user._id, access: "auth" };
    jwt.sign(payload, process.env.JWT_SECRET || "secret", (err, token) => {
      if (err) reject(err);
      resolve(token);
    });
  }).then(token => {
    user.tokens.push({ access: "auth", token });
    return user.update({ $set: { tokens: user.tokens } });
  });
};

// Verifies authorization token and returns a user
userSchema.statics.decodeAuthorizationToken = function(token) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.JWT_SECRET || "secret", (err, decoded) => {
      if (err) reject(err);
      resolve(decoded);
    });
  }).then(decoded => {
    return User.findOne({
      _id: decoded._id,
      "tokens.token": token,
      "tokens.access": decoded.access
    }).populate("family");
  });
};

userSchema.statics.destroyAuthorizationToken = token =>
  userSchema.statics.decodeAuthorizationToken(token);

userSchema.methods.authenticate = function(password) {
  return bcrypt.compare(password, this.password);
};

userSchema.statics.getFamilyMembers = familyId => User.find({ familyId });

userSchema.statics.getAdmins = function() {
  return User.find({ admin: true }).populate("family").then(admins => {
    return admins.sort((a, b) => (a.name.last < b.name.last ? -1 : 1));
  });
};

userSchema.statics.getNonAdmins = function() {
  return User.find({ admin: false }).populate("family").then(nonAdmins => {
    return nonAdmins.sort((a, b) => (a.name.last < b.name.last ? -1 : 1));
  });
};

userSchema.methods.getRegisterableChallengesCount = function() {
  var user = this;
  var futureChallenges;
  return Challenge.getFutureChallenges()
    .then(challenges => {
      futureChallenges = challenges;
      return Participation.setUserParticipationForChallenges(
        user,
        futureChallenges
      );
    })
    .then(() => {
      return futureChallenges.reduce((total, challenge) => {
        return (total += challenge.participation ? 0 : 1);
      }, 0);
    });
};

userSchema.virtual("fullName").get(function() {
  return this.name.first + " " + this.name.last;
});

var User = mongoose.model("User", userSchema);

module.exports = User;
