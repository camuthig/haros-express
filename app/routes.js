var routes              = require('./routes/index');
var users               = require('./routes/users');
var auth                = require('./routes/auth');
var bodyParser          = require('body-parser');
var config              = require('config');
var Haros               = require('haros').GatewayService;
var JsonResponseService = require('./services/json');

module.exports = function(app, passport) {
  // Set up the API Gateway routes
  var haros = new Haros(null, {database: config.get('database.url')});
  haros.use(passport.authenticate('jwt', { session: false}));
  haros.loadServices();

  app.use(haros.forward());

  var jsonResponseService = new JsonResponseService();

  // Add the body parsing only for locally handled APIs
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));

  // Local APIs
  app.use('/', routes);
  app.use('/auth', auth);
  app.use('/users', passport.authenticate('jwt', { session: false}), users);

  /*
    Handling routes for managing the actual services is the job of the gateway service. 
  */
  app.use('/services', passport.authenticate('jwt', { session: false}), haros.routes());
	
}