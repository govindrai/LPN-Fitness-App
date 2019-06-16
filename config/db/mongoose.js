// NPM Modules
const mongoose = require('mongoose');

// Local Modules
const logger = require('../../utils/logger');
const { MONGO_URL } = require('../keys.js');

mongoose.connection.on('error', () => {
  logger.error('config:mongoose:connection error listener', 'MongoDB connection error');
  process.env.IS_CONNECTED = false;
  throw new Error('MongoDB connection error');
});

async function connect() {
  logger.entered('config:mongoose:connect');
  if (process.env.IS_DEPLOYED) {
    mongoose.set('debug', (collectionName, operationName, doc, proj, somethingelse, somethingotherelse) => {
      logger.info('Mongoose Debug Log', {
        collectionName,
        operationName,
        doc,
        proj,
        somethingelse,
        somethingotherelse,
        rerunQuery: `${collectionName}.${operationName}(${JSON.stringify(doc)}), ${JSON.stringify(proj)})`,
      });
    });
  } else {
    mongoose.set('debug', true);
  }

  try {
    await mongoose.connect(MONGO_URL, {
      useNewUrlParser: true,
      useFindAndModify: false,
      useCreateIndex: true,
      autoIndex: false,
      connectTimeoutMS: 30000,
      socketTimeoutMS: 30000,
    });
    logger.info('config:mongoose:connect', `Database connection to ${MONGO_URL} created`);
  } catch (e) {
    logger.error('config:mongoose:connect', 'CRITICAL:Error connecting to database', e);
    throw e;
  }
}

async function dropDatabase() {
  logger.entered('config:mongoose:dropDatabase');
  try {
    const startTime = new Date();
    await mongoose.connection.dropDatabase();
    logger.info('config:mongoose:dropDatabase', `Database successfully dropped. Operation took ${(new Date() - startTime) / 1000 / 60} minutes`);
  } catch (e) {
    logger.error('config:mongoose:dropDatabase:Error dropping database', e);
    throw e;
  }
}

async function disconnect() {
  logger.entered('config:mongoose:disconnect');
  try {
    await mongoose.connection.close();
    logger.info('config:mongoose:disconnect', 'Database connection closed');
  } catch (e) {
    logger.error('config:mongoose:disconnect:Error disconnecting from database', e);
    throw e;
  }
}

mongoose.plugin(plugin);

module.exports = {
  connect,
  disconnect,
  dropDatabase,
};

// HELPERS

/**
 *
 * @param {Object} schema a mongoose schema
 */
function plugin(schema) {
  // logger.log('debug:modules:db.js:plugin');
  // plugin can be bypassed for any schema by setting the skipCustomPlugins property to true in the schema constructor's schema options parameter
  if (schema.options.skipCustomPlugins === true) {
    return;
  }

  // enables timestamps on all schemas
  schema.set('timestamps', true);

  // ensures the plugin does not overwrite schema.options.toObject object
  schema.options.toObject = schema.options.toObject || {};

  // sets up a transformation that remove paths with hidden property in their schemaTypes
  // when document.prototype.toObject() is invoked on a document
  // transformation can be bypassed by passing { hide: false } to toObject()
  schema.options.toObject.transform = (doc, ret, options) => {
    console.log('info:module:db.js:plugin:toObjectTransformHook');
    if (options.hide === false) {
      logger.info('config:mongoose:plugin:toObjectTransformHook', 'Hiding of fields explicity turned off');
      return ret;
    }

    logger.info('config:mongoose:plugin:toObjectTransformHook', 'Hiding fields');
    doc.schema.eachPath((path, schemaType) => {
      if (schemaType.options.hidden) {
        delete ret[path];
      }
    });

    return ret;
  };
}
