const connectToDb = require('../config/db/mongoose').connect;
const logger = require('../utils/logger');

// TODO: Get consistent logging everywhere
module.exports = async function connect() {
  logger.log('info:middleware:connect');
  await connectToDb();
};
