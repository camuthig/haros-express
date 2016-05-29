var validate = require('validate.js');
var _        = require('lodash');

UserRequest = function() {
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
  return next(
    validate(req.body, patchConstraints), 
    validate.cleanAttributes(req.body, patchConstraints)
  ); 
}

module.exports = UserRequest;