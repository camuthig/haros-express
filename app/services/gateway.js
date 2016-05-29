var Services       = require('../models/service');
var GatewayManager = require('./gateway/routes');
var rocky          = require('rocky');
var _              = require('lodash');

function GatewayService(userMiddleware, middleware) {
  if (!userMiddleware) {
    // TODO ERR
  }
  this.userMiddleware = userMiddleware;

  if (middleware) {
    if (!Array.isArray(middleware)) {
      middleware = [ middleware ];
    }

    this.middleware = middleware
  }

  // TODO: While have this in memory is okay - it doesn't scale horizontally. Move to some shared memory????
  this.services = {};
}

GatewayService.prototype.getStaticProxy = function(service) {
  var proxy = rocky();
  proxy
    .forward(service.static.forward)
    .options({ timeout: 3000, forwardHost: true, forwardOriginalBody: true })
    .on('proxy:error', function (err) {
      console.log('Error:', err)
    })
    .on('proxyReq', function (proxyReq, req, res, opts) {
      console.log('Proxy request:', req.url, 'to', opts.target)
    })
    .on('proxyRes', function (proxyRes, req, res) {
      console.log('Proxy response:', req.url, 'with status', res.statusCode)
    });

  if (service.replays) {
    service.replays.map(function(replay) {
      proxy.replay(replay);
    });
  }

  proxy.all(
    '/' + service.base,
    this.userMiddleware.authenticate('jwt', { session: false})
  );

  proxy.all(
    '/' + service.base + '/*',
    this.userMiddleware.authenticate('jwt', { session: false})
  );

  return proxy;
  
};

// TODO: Need a better way of handling the passport nonsense
// Maybe a list of middlewares that I want to add on
// TODO: Need to be a bit more flexible with this too, maybe allow the API to accept a list of forwards.
//    This would let different collections of routes use different middleware.
// Really, I just need "passport" to be anything that creates a user with the right information....
GatewayService.prototype.loadServices = function() {
  this.services = {};
  var gateway = this;
  return Services.find().exec(function(err, services) {
    if (err) {
      // TODO maybe an error or something here???
      console.log('Ahhhh shiz');
      return;
    }
    var storedServices = {};
    services.map(function (service) {
      switch (service.type) {
        case 'consul':
          // Need to implement everything for consul
        case 'static':
          var proxy = gateway.getStaticProxy(service);
          storedServices[service.base] = proxy.middleware();
          break;
        default:
          // TODO maybe an error or something here???
          console.log('What the what?!? Missing configuration info.')
      }
    }, this);

    // Why does this 'this' work but not the one in the map?
    this.services = storedServices;
  });
};

GatewayService.prototype.manage = function() {
  var manager = new GatewayManager();
  return manager.routes(this, manager);
}

GatewayService.prototype.forward = function(req, res, next) {
  // Find the correct service to forward to
  // Call the linked middleware
  var base = req.path.split('/')[1];
  if (this.services.hasOwnProperty(base)) {
    this.services[base](req, res, function (err) {
      if (err) {
        return next(err);
      } else {
        // TODO Would skipping this stop it from going to a duplicate route
        next();
      }
    });
  } else {
    // 404
    // res.status(404).json({err: 'Dern it. Did not find a service to forward to.'});
    next();
  }
}


/************************************************************************************************************
          Everything after this point is about super fine-grained route permissions
          Currently these are just thoughts, as providing a central permissions service
          like this would require each downstream app to have a client to properly push
          changes back up to here. I just don't want to deal with that right now.

          So none of this is currently used anywhere.
************************************************************************************************************/

GatewayService.prototype.getPermissions = function(user) {
  var Permission = require('../models/permission');
  return Permission.find({user: user._id}, 'resource allowed subs').exec();
}

var getResource = function (permissions, search) {
  var found = permissions.filter(function(resource, index, array) {
    return resource.hasOwnProperty('resource') && resource.resource === search
  });

  return found[0];
}


/**
 * Determine if a given action on a nested resource is allowed
 * by recursively going down the resources.
 */
var isAllowed = function (permissions, resources, action) {
  if (resources.length === 0) {
    return false;
  }

  resource = getResource(permissions, resources[0]);
  if (!resource) {
    // -1
    // return false;
    return -1;
  }

  if (resources.length === 1) {
    // 1 or -1
    if (_.indexOf(resource.allowed, action.toUpperCase()) > -1) {
      return 1;
    } else {
      return -1;
    }
  } 

  return isAllowed(resource.subs, resources.slice(1), action);
}

/**
 * Middleware function to check that a a user is allowed to hit this route 
 */
var authorize = function(req, res, next) {
  if (!req.user) {
    res.status(401).json({'err': 'Missing a user'});
  } else {
    // TODO Need to handle leading and trailing slashes properly
    var allowed = isAllowed(req.user.permissions, req.path.split('/').slice(1), req.method);

    if (allowed === 1) {
      next()
    } else if (allowed === -1) {
      res.status(401).json({'err': 'That is not allowed!!!!'});
    } else {
      res.status(404).json({'err': 'Resource not found'});
    }
  }
};

// And export to so that we can eat our own dog food more easily.
GatewayService.prototype.authorize = authorize;


module.exports = GatewayService;