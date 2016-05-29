var mongoose = require('mongoose');
var MongooseError = require('mongoose/lib/error')
var _ = require('lodash');

var handleError = function(err, req, res, next) {
  if (MongooseError.hasOwnProperty(err.message.name) || MongooseError.hasOwnProperty(err.name)) {
    var error = new Error('Internal Error');

    if (err.message.name === 'ValidationError') {
      // handle a validation error
      error.status = 401;
      error.message = _.mapValues(err.message.errors, function(details) {
        return [details.message];
      });
    }

    return next(error);
  }

  next(err);
}

module.exports = handleError;