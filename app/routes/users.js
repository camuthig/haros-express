var express = require('express');
var router = express.Router();
var User = require('../models/user');
var Request = require('./requests/users');
var request = new Request();
var _       = require('lodash');

/* GET users listing. */
router.get('/', function(req, res, next) {
  var query = User.find();
  if (req.query.q) {
    query.or([{name: new RegExp('.*' + req.query.q + '.*', "i")}, {email: new RegExp('.*' + req.query.q + '.*', "i")}]);
  }
  if (req.query.name) {
    query.find({name: req.query.name});
  }
  if (req.query.email) {
    query.find({email: req.query.email});
  }

  query.exec(function(err, users) {
    if (err) {
      return next(err);
    }

    res.json(users);
  });
});

router.patch('/:id', function(req, res, next) {
  request.patch(req, function(err, body) {
    if (err) {
      return next(err);
    } else {
      User.findById(req.params.id, function(err, service) {
        if (err) {
          return next(err);
        }

        if (!user) {
          var error = new Error('User not found');
          error.status = 404;
          return next(error)
        }

        service = _.merge(service, body);
        service.save(function(err) {
          if (err) {
            return next(err);
          }

          res.status(200).json(service);
        });
      });
    }
  });
});

router.get('/me', function(req, res, next) {
  User.findOne({_id: req.user.id}).select('name email').exec(function(err, user) {
    if (err) {
      return next(err);
    }


    res.json(user);
  });
});

router.get('/:id', function(req, res, next) {
  User.findOne({_id: req.params.id}).select('name email').exec(function(err, user) {
    if (err) {
      return next(err);
    }

    if (!user) {
      var error = new Error('User not found');
      error.status = 404;
      return next(error)
    }

    res.json(user);
  });
});

module.exports = router;
