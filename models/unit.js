const mongoose = require('mongoose');

const unitSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  abbreviation: {
    type: String,
    required: true,
  },
  plural: {
    type: String,
    required: true,
  },
});

const Unit = mongoose.model('Unit', unitSchema);

module.exports = Unit;
