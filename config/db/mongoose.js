const mongoose = require('mongoose'),
  { MONGO_URL } = require('../keys.js');

mongoose.Promise = global.Promise;
mongoose.set('debug', true);

mongoose
  .connect(
    MONGO_URL,
    { useNewUrlParser: true }
  )
  .then(() => {
    console.log('Successfully connected to LPN');
    console.log('Model Names: ', mongoose.modelNames());
  })
  .catch(e => console.log('There was an error: ', e));

module.exports = mongoose;
