var validate = require('validate');

BaseRequest = function() {
  this.topLevel = 'data';
  this.validate = validate;
};

BaseRequest.prototype._postConstraints = {

}

BaseRequest.prototype.post = function(req, next) {
  return next(
    validate(req.body, this._patchConstraints), 
    validate.cleanAttributes(req.body, this._patchConstraints)
  );
}

module.exports BaseRequest;