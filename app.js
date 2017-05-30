// Export Modules
var express = require('express'),
  methodOverride = require('method-override'),
  session = require('express-session'),
  path = require('path'),
  favicon = require('serve-favicon'),
  logger = require('morgan'),
  cookieParser = require('cookie-parser'),
  bodyParser = require('body-parser'),
  sassMiddleware = require('node-sass-middleware');

// Export Routers
var index = require('./routes/index'),
  users = require('./routes/users'),
  families = require('./routes/families'),
  units = require('./routes/units'),
  activities = require('./routes/activities'),
  challenges = require('./routes/challenges'),
  settings = require('./routes/settings');

// Create Express App
var app = express();

// Setup View Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Configure Middleware
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true
}));
app.use(methodOverride('_method'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(sassMiddleware({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  indentedSyntax: true, // true = .sass and false = .scss
  sourceMap: true
}));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);
app.use('/families', families);
app.use('/units', units);
app.use('/activities', activities);
app.use('/challenges', challenges);
app.use('/settings', settings);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
