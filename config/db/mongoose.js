// NPM Modules
const mongoose = require('mongoose');

// Local Modules
const Logger = require('../../utils/logger');

const { MONGO_URL } = require('../keys.js');

async function connect() {
  if (process.env.IS_DEPLOYED) {
    mongoose.set('debug', (collectionName, operationName, doc, proj, somethingelse, somethingotherelse) => {
      Logger.log('info:Mongoose Debug Log', {
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
    await mongoose.connect(
      MONGO_URL,
      { autoIndex: false }
    );
    Logger.log('info:module:db:connect', `Database connection to ${MONGO_URL} created`);
  } catch (e) {
    Logger.log('error:module:db:connect', 'CRITICAL:Error connecting to database', e);
    throw e;
  }
}

async function dropDatabase() {
  Logger.log('info:module:db:dropDatabase');
  try {
    const startTime = new Date();
    await mongoose.connection.dropDatabase();
    Logger.log('info:module:db', 'Database successfully dropped');
    Logger.log('info:module:db:dropDatabase', `Drop database operation took ${(new Date() - startTime) / 1000 / 60} minutes`);
  } catch (e) {
    Logger.log('error:module:db:dropDatabase', 'Error dropping database', e);
    throw e;
  }
}

async function disconnect() {
  Logger.log('info:module:db:disconnect');
  try {
    await mongoose.connection.close();
    Logger.log('info:module:db:disconnect', 'Database connection closed');
  } catch (e) {
    Logger.log('error:module:db:disconnect', 'Error disconnecting from database', e);
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
  // Logger.log('debug:modules:db.js:plugin');
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
  schema.options.toObject.transform = function(doc, ret, options) {
    Logger.log('info:module:db.js:plugin:toObjectTransformHook');
    if (options.hide === false) {
      Logger.log('info:module:db.js:plugin:toObjectTransformHook', 'Hiding of fields explicity turned off');
      return ret;
    }

    Logger.log('info:module:db.js:plugin:toObjectTransformHook', 'Hiding fields');
    doc.schema.eachPath((path, schemaType) => {
      if (schemaType.options.hidden) {
        delete ret[path];
      }
    });

    return ret;
  };
}
