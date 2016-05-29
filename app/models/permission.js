// app/models/permission.js

var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');
var Schema   = mongoose.Schema;
var ObjectId = mongoose.SchemaTypes.ObjectId;

var SubPermissionSchema = mongoose.Schema({
  resource: String,
  allowed: [String],
  subs: [this]
}, {_id: false});

// define the schema for our user model
var PermissionSchema = mongoose.Schema({
  resource : String,
  user     : ObjectId,
  allowed  : [String],
  subs     : [SubPermissionSchema],
});

// var autoPopulateSubs = function(next) {
//   this.populate('subs');
//   next();
// };

// PermissionSchema.
//   pre('findOne', autoPopulateSubs).
//   pre('find', autoPopulateSubs);

// create the model for users and expose it to our app
module.exports = mongoose.model('Permission', PermissionSchema);