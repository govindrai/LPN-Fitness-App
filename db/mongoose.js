var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/lpn');
mongoose.connection.on('error', () => {
  console.log("Mongoose Collection Error!");
});

mongoose.Promise = global.Promise;
mongoose.set("debug", true);

module.exports = mongoose;

