// NPM Modules
const mongoose = require('mongoose');

// Local Modules
const logger = require('../../utils/logger');

const { MONGO_URL } = require('../keys.js');

async function connect() {
  logger.log('info:config:mongoose:connect');
  if (process.env.IS_DEPLOYED) {
    mongoose.set('debug', (collectionName, operationName, doc, proj, somethingelse, somethingotherelse) => {
      logger.log('info:Mongoose Debug Log', {
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

  mongoose.set('useNewUrlParser', true);
  mongoose.set('useFindAndModify', false);
  mongoose.set('useCreateIndex', true);

  try {
    await mongoose.connect(MONGO_URL, { autoIndex: false });
    logger.log('info:config:mongoose:connect', `Database connection to ${MONGO_URL} created`);
  } catch (e) {
    logger.log('error:config:mongoose:connect', 'CRITICAL:Error connecting to database', e);
    throw e;
  }
}

async function dropDatabase() {
  logger.log('info:config:mongoose:dropDatabase');
  try {
    const startTime = new Date();
    await mongoose.connection.dropDatabase();
    logger.log('info:module:db', 'Database successfully dropped');
    logger.log('info:config:mongoose:dropDatabase', `Drop database operation took ${(new Date() - startTime) / 1000 / 60} minutes`);
  } catch (e) {
    logger.log('error:config:mongoose:dropDatabase', 'Error dropping database', e);
    throw e;
  }
}

async function disconnect() {
  logger.log('info:config:mongoose:disconnect');
  try {
    await mongoose.connection.close();
    logger.log('info:config:mongoose:disconnect', 'Database connection closed');
  } catch (e) {
    logger.log('error:config:mongoose:disconnect', 'Error disconnecting from database', e);
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
  schema.options.toObject.transform = function (doc, ret, options) {
    logger.log('info:module:db.js:plugin:toObjectTransformHook');
    if (options.hide === false) {
      logger.log('info:module:db.js:plugin:toObjectTransformHook', 'Hiding of fields explicity turned off');
      return ret;
    }

    logger.log('info:module:db.js:plugin:toObjectTransformHook', 'Hiding fields');
    doc.schema.eachPath((path, schemaType) => {
      if (schemaType.options.hidden) {
        delete ret[path];
      }
    });

    return ret;
  };
}
