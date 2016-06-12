var   jwt            = require('jsonwebtoken')
    , config         = require('config');

var JwtService = function (options) {
  this.options = {
    expiresIn: '60m',
  };

  this.secret = config.get('auth.jwt.secret');
};

JwtService.prototype.createToken = function (user) {
  var obj =  {
    sub: user._id,
    user: {
      id: user._id,
      name: user.name,
      roles: user.roles
    }
  };
  var token = jwt.sign(obj, this.secret, this.options);

  return token;
};

module.exports = JwtService;