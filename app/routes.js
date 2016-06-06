var routes              = require('./routes/index');
var users               = require('./routes/users');
var auth                = require('./routes/auth');
var bodyParser          = require('body-parser');
var GatewayService      = require('./services/gateway');
var JsonResponseService = require('./services/json');

module.exports = function(app, passport) {
  // Set up the API Gateway routes
  gatewayService = new GatewayService(passport);
  gatewayService.loadServices();

  var jsonResponseService = new JsonResponseService();

  app.use(gatewayService.forward);

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
  app.use('/services', passport.authenticate('jwt', { session: false}), gatewayService.manage());
	
}