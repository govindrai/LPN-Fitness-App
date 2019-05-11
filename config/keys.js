let keys;

/* eslint-disable global-require */
if (process.env.NODE_ENV === 'production') {
  keys = require('./prodkeys');
} else {
  try {
    keys = require('./devkeys');
  } catch (e) {
    if (e.message === "Cannot find module './devkeys'") {
      const err = new Error('First time using the repo? You need to create a devkeys.js file in /config. The contents should match prodkeys.js, replaced with your personal keys.');
      err.name = 'MissingKeyFile';
      throw err;
    }
    throw e;
  }
}
/* eslint-enable global-require */


module.exports = keys;
