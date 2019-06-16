require('colors');

class Logger {
  debug(message = 'Made it here!') {
    const log = Logger.getLog('debug', '', message);
    console.log(log.bgBlue.black);
  }

  info(description = '', message = 'Made it here!') {
    const log = Logger.getLog('info'.green, description, message);
    console.log(log);
  }

  error(description = '', error = new Error('You did not supply an error')) {
    if (error.stack) {
      error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    }
    const log = Logger.getLog('error'.red, description, error);
    console.log(log.bgMagenta.red);
  }

  entered(description = '') {
    const enteredFunctionName = description.split(':').pop();
    const log = Logger.getLog('info'.green, description, `Entered ${enteredFunctionName}`);
    console.log(log);
  }

  static getLog(logLevel, description, message) {
    return `${logLevel} ${description} ${JSON.stringify(message)}`;
  }
}

module.exports = new Logger();
