const mongoose = require('mongoose');

const User = require('./../models/user');
const Challenge = require('./../models/challenge');
var Schema = mongoose.Schema;

var participationSchema = new Schema({
  challengeId: {
    type: [{Schema.Types.ObjectId, ref: 'Challenge'}],
    required: true
  },
    userId: {
      type: [{Schema.Types.ObjectId, ref 'User'}],
      required: true
    }
});

var Participation = mongoose.model('Participation', participationSchema);

module.exports = Participation;
