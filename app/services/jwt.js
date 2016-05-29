var   jwt            = require('jsonwebtoken')
    , config         = require('config')
    , GatewayService = require('./gateway');

var JwtService = function (options) {
  this.options = {
    expiresIn: '60m',
  };

  this.secret = config.get('auth.jwt.secret');

  this.gatewayService = new GatewayService();
};

JwtService.prototype.sign = function(perms) {
  
}

JwtService.prototype.createToken = function (user, perms) {
  var obj =  {
    sub: user._id,
    user: {
      id: user._id,
      name: user.name,
      permissions: perms
    }
  };
  var token = jwt.sign(obj, this.secret, this.options);

  return token;
};

module.exports = JwtService;