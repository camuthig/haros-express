var validate    = require('validate.js');
var _           = require('lodash');
var JsonRequest = require('../../services/json/request');

UserRequest = function() {
  this.request = new JsonRequest();
  validate.validators.stringArray = stringArray;
};

var stringArray = function(value, options, key, attributes) {
  console.log(value);
  var message = 'must be a string array';
  if (value === undefined) {
    return;
  }
  
  if(!validate.isArray(value)) {
    return message;
  }

  if (_.find(value, function(elem) {return !validate.isString(elem)}) !== -1) {
    return message;
  }

};

var patchConstraints = {
  name: {},
  email: {
    email: true
  },
  roles: {
    stringArray: true
  }
};

UserRequest.prototype.patch = function(req, next) {
  // validate the request and clean it
  var jsonErrors = this.request.validateResource(req);
  if (!_.isEmpty(jsonErrors)) {
    return next(
      jsonErrors,
      null
    );
  }

  return next(
    validate(req.body.data.attributes, patchConstraints), 
    validate.cleanAttributes(req.body.data.attributes, patchConstraints)
  ); 
}

module.exports = UserRequest;