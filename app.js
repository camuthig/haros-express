process.env['NODE_CONFIG_DIR'] = './config/env';

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var config = require('config');
var passport = require('passport');
var session = require('express-session')

var app = express();

// Connect to the database
require('./config/database.js')(app, config);

// Configure and initialize passport for the app
require('./config/passport.js')(app, config);
app.use(session({ secret: 'wardenslovetobewardensblah' })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


// Initialize the routes
require('./app/routes.js')(app, passport);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

var mongooseErrors = require('./app/services/mongoose/error');

app.use(mongooseErrors);

// Define the global error handler
var handleGlobalErrors = function (err, req, res, next) {
  var JsonError = require('./app/services/json/error');
  var jsonError = new JsonError(app);
  res.status(jsonError.status(err)).json(jsonError.error(err));
}

app.use(handleGlobalErrors);


module.exports = app;
