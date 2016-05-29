var mongoose = require('mongoose');

module.exports = function(app, config) {
	mongoose.connect(config.get('database.url'));
}