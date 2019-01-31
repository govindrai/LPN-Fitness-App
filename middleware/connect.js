const connectToDb = require('../config/db/mongoose').connect;
const logger = require('../utils/logger');

module.exports = async function connect(req, res, next) {
  logger.log('info:middleware:connect');
  await connectToDb();
  return next();
};
