const mongoose = require('mongoose');

const User = require('./../models/user');
const Challenge = require('./../models/challenge');
var Schema = mongoose.Schema;

var participationSchema = new Schema({
  challenge: {
    type: Schema.Types.ObjectId,
    ref: 'Challenge',
    required: true
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true

  },
  point: {
    type: Schema.Types.ObjectId,
    ref: 'Point',
    required: true
  }
});

var Participation = mongoose.model('Participation', participationSchema);

module.exports = Participation;
