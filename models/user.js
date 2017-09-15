const mongoose = require("mongoose"),
  validator = require("validator"),
  jwt = require("jsonwebtoken"),
  bcrypt = require("bcrypt");

const Schema = mongoose.Schema,
  Challenge = require("./challenge"),
  Participation = require("./participation");

let userSchema = new Schema({
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
        validator: isExistingEmail
      }
    ]
  },
  password: {
    type: String,
    required: true,
    minlength: [6, "Passwords must be at least 6 characters long."]
    // validate: {
    //   isAsync: true,
    //   validator: hashPassword
    // }
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

userSchema.statics.hashPassword = function(password) {
  return bcrypt
    .hash(password, 10)
    .then(hash => hash)
    .catch(e => console.log("error hashing password: ", e));
};

userSchema.post("validate", function(doc) {
  const user = this;
  if (user.isModified("password")) {
    User.hashPassword(user.password)
      .then(hash => {
        user.password = hash;
      })
      .catch(e => console.log(e));
  }
});

userSchema.methods.generateAuthorizationToken = function() {
  let user = this;
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

userSchema.statics.getAdmins = function() {
  return User.find({ admin: true })
    .populate("family")
    .then(admins => {
      return admins.sort((a, b) => (a.name.last < b.name.last ? -1 : 1));
    });
};

userSchema.statics.getNonAdmins = function() {
  return User.find({ admin: false })
    .populate("family")
    .then(nonAdmins => {
      return nonAdmins.sort((a, b) => (a.name.last < b.name.last ? -1 : 1));
    });
};

userSchema.methods.getRegisterableChallengesCount = function() {
  const user = this;
  let challengesArray;
  return Challenge.getFutureChallenges()
    .then(challenges => {
      challengesArray = challenges.map(challenge => challenge._id);
      return Participation.find({ user })
        .where("challenge")
        .in(challengesArray)
        .count();
    })
    .then(count => challengesArray.length - count);
};

function isExistingEmail(email, cb = null) {
  return User.findOne({ email }).then(existingUser => {
    if (cb) {
      return cb(!existingUser, "Email address is already in use.");
    }
    return !existingUser;
  });
}

userSchema.virtual("fullName").get(function() {
  return this.name.first + " " + this.name.last;
});

var User = mongoose.model("User", userSchema);

module.exports = User;
