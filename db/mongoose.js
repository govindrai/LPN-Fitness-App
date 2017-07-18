var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/lpn', error => {
  if (error) console.log('There was an error: ', error);
  console.log('Successfully connected to LPN');
  console.log(mongoose.modelNames());
});

mongoose.connection.on('error', () => {
  console.log('Mongoose Collection Error!');
});

mongoose.Promise = global.Promise;
mongoose.set('debug', true);

module.exports = mongoose;
