const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    required: true,
  },
  description: {
    type: String,
  },
  points: {
    type: Number,
    required: true,
  },
  scale: {
    type: Number,
    required: true,
  },
  unit: {
    type: mongoose.Types.ObjectId,
    ref: 'Unit',
    required: true,
  },
});

const Activity = mongoose.model('Activity', activitySchema);

module.exports = Activity;
