class Logger {
  static init(event) {
    Logger.userId = event.requestContext && event.requestContext.authorizer ? event.requestContext.authorizer.userId : 'guest';
  }

  // TODO: either change the name of this static function or change the variable name log in the function below
  static log(description, message, error) {
    const [logLevel, ...logName] = description.split(':');
    const log = {
      userId: Logger.userId,
      logLevel,
      logName: logName.join(':'),
      message,
    };

    if (message instanceof Error) {
      console.log(message);
      message = message.name;
      log.level = 'error';
    }

    if (error) {
      console.log(error);
      log.error = error.stack;
    }

    console.log(JSON.stringify(log, null, 4));
  }
}

module.exports = Logger;

// TODO: REDO Logger to provide log.info, log.warn, and log.error properties
// error should be calculated based on loglevel (probably should be called log type which should be error)
