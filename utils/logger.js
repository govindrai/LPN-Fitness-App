const colors = require('colors'); /* eslint-disable-line no-unused-vars */

class Logger {
  constructor(logContext) {
    this.infoLogContext = `${'info'.green}:${logContext}`;
    this.errorLogContext = `${'error'}:${logContext}`;
    this.debugLogContext = `${'debug'}:${logContext}`;
    this.enteredFunctionName = logContext.split(':').pop();
  }

  debug(description, message) {
    if (description) {
      description = `${this.debugLogContext}:${description}`;
    } else {
      description = this.debugLogContext;
    }
    const log = Logger.log(description, message);
    console.log(log.bgWhite.black);
  }

  info(description, message) {
    if (description) {
      description = `${this.infoLogContext}:${description}`;
    } else {
      description = this.infoLogContext;
    }
    const log = Logger.log(description, message);
    console.log(log);
    // console.log(`\x1b[48;5;2m\x1b[38;5;15m${log}`);
  }

  error(description, error) {
    if (description) {
      description = `${this.errorLogContext}:${description}`;
    } else {
      description = this.errorLogContext;
    }
    const log = Logger.log(description, error);
    console.log(log.bgRed.white);
  }

  entered() {
    const message = `Entered ${this.enteredFunctionName}`;
    const log = Logger.log(this.infoLogContext, message);
    console.log(log);
  }

  // TODO: either change the name of this static function or change the variable name log in the function below
  static log(description, message) {
    const [logLevel, ...logName] = description.split(':');
    let log = `${logLevel} ${logName.join(':')}`;

    if (message) {
      if (message instanceof Error) {
        const error = message;
        console.log(error);
        log += ` - ${error.name}`;
        log += ` - ${error.stack}`;
      } else {
        log += ` - ${message}`;
      }
    }

    return log;
  }
}

module.exports = Logger;
