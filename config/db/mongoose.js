// NPM Modules
const mongoose = require('mongoose');

// Local Modules
const Logger = require('../../utils/logger');
const { MONGO_URL } = require('../keys.js');

const logger = new Logger('config:mongoose');

mongoose.connection.on('error', () => {
  logger.error('connection error listener', 'MongoDB connection error');
  process.env.IS_CONNECTED = false;
  throw new Error('MongoDB connection error');
});

async function connect() {
  logger.entered('connect');
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
    logger.info('connect', `Database connection to ${MONGO_URL} created`);
  } catch (e) {
    logger.error('connect', 'CRITICAL:Error connecting to database', e);
    throw e;
  }
}

async function dropDatabase() {
  logger.entered('dropDatabase');
  try {
    const startTime = new Date();
    await mongoose.connection.dropDatabase();
    logger.info('dropDatabase', 'Database successfully dropped');
    logger.info('dropDatabase', `Drop database operation took ${(new Date() - startTime) / 1000 / 60} minutes`);
  } catch (e) {
    logger.error('dropDatabase:Error dropping database', e);
    throw e;
  }
}

async function disconnect() {
  logger.entered('disconnect');
  try {
    await mongoose.connection.close();
    logger.info('disconnect', 'Database connection closed');
  } catch (e) {
    logger.error('disconnect:Error disconnecting from database', e);
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
      console.log('info:module:db.js:plugin:toObjectTransformHook', 'Hiding of fields explicity turned off');
      return ret;
    }

    console.log('info:module:db.js:plugin:toObjectTransformHook', 'Hiding fields');
    doc.schema.eachPath((path, schemaType) => {
      if (schemaType.options.hidden) {
        delete ret[path];
      }
    });

    return ret;
  };
}
