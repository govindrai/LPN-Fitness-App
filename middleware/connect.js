const connectToDb = require('../config/db/mongoose').connect;
const logger = require('../utils/logger');

let isConnected = false;
// TODO: Get consistent logging everywhere
module.exports = async function connect() {
  logger.log('info:middleware:connect');
  if (!isConnected) {
    await connectToDb();
    isConnected = true;
  }
};
