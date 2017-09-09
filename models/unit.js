const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let unitSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  abbreviation: {
    type: String,
    required: true
  }
});

let Unit = mongoose.model('Unit', unitSchema);

module.exports = Unit;
