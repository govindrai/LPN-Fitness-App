const connectToDb = require('../config/db/mongoose').connect;
const logger = require('../utils/logger');

// TODO: What happens when connection is disconnected?
// TODO: I don't like this logic, fix this eventually
process.env.IS_CONNECTED = 'false';
// TODO: Get consistent logging everywhere

module.exports = async function connect() {
  logger.entered('middleware:connect');
  if (process.env.IS_CONNECTED === 'false') {
    await connectToDb();
    process.env.IS_CONNECTED = 'true';
  }
};
