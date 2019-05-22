// Modules
const express = require('express');
const favicon = require('serve-favicon');
const methodOverride = require('method-override');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const sassMiddleware = require('node-sass-middleware');
const { addAsync } = require('@awaitjs/express');
const cookieSession = require('cookie-session');

// Local Modules
const keys = require('./config/keys');

// Express Routes
const index = require('./routes/index');
const users = require('./routes/users');
const families = require('./routes/families');
const units = require('./routes/units');
const activities = require('./routes/activities');
const challenges = require('./routes/challenges');
const points = require('./routes/points');
const stats = require('./routes/stats');
const participants = require('./routes/participants');

// Middleware
const connect = require('./middleware/connect');
const verifyAuthorization = require('./middleware/verifyAuthorization');
const setLocals = require('./middleware/setLocals');

// Create Express App
const app = addAsync(express());

// Setup View Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(favicon(path.join(__dirname, 'public/images', 'favicon.ico')));
app.use(methodOverride('_method'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// TODO: we don't really need to use cookies, we can just use headers?
// We can use both access and refresh token and try the refresh token if it doesn't WERK
// refresh token needs to be checked in the database too see that it is still valid but main token doesnt need that
app.use(
  cookieSession({
    name: 'LPNSessionCookie',
    // keys: [
    //   /* secret keys */ // TODO: FIGURE OUT THIS OPTION
    // ],
    secret: keys.COOKIE_SECRET,
    httpOnly: true,
    // secure: ? TODO: FIGURE OUT THIS OPTION
    maxAge: 7776000000, // 90 days
  })
);

// TODO: this should not be part of the main codebase
// This should compile the css and then the app should just have static access to those assets
app.use(
  sassMiddleware({
    src: path.join(__dirname, 'public/stylesheets'),
    dest: path.join(__dirname, 'public/stylesheets'),
    debug: true,
    indentedSyntax: true, // true = .sass and false = .scss
    // sourceMap: true,
    prefix: '/stylesheets',
  })
);

app.use(express.static(path.join(__dirname, 'public')));
app.use('/libs', express.static(path.join(__dirname, '/node_modules/jquery/dist/')));
app.use('/libs', express.static(path.join(__dirname, '/node_modules/typeahead.js/dist/')));

// these middleware are run before any route is rendered below
// TODO: right now we connect to mongodb before serving any request. Maybe there are some routes where DB connection is not necessary?
app.useAsync(connect, verifyAuthorization, setLocals);

app.use('/', index);
app.use('/users', users);
app.use('/families', families);
app.use('/units', units);
app.use('/activities', activities);
app.use('/challenges', challenges);
app.use('/points', points);
app.use('/stats', stats);
app.use('/participants', participants);

// catch 404 and forward to error handler
app.use((err, req, res, next) => {
  console.log('Error!');
  console.log(err);
  if (res.headersSent) {
    return next(err);
  }

  res.render('error', {
    error: err,
  });
});

// // error handler
// app.use(function(err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};

//   // render the error page
//   res.status(err.status || 500);
//   res.render('error');
// });

module.exports = app;
