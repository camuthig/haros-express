var express = require('express');
var router = express.Router();
var User = require('../models/user');
var Request = require('./requests/users');
var request = new Request();
var _       = require('lodash');
var JsonResponse = require('../services/json');

var jsonResponse = new JsonResponse('user');

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

  query.select('name email').exec(function(err, users) {
    if (err) {
      return next(err);
    }

    res.json(jsonResponse.parseObjects(users));
  });
});

router.patch('/:id', function(req, res, next) {
  request.patch(req, function(err, body) {
    if (err) {
      return next(err);
    } else {
      User.findOne({_id: req.params.id}).select('name email').exec(function(err, user) {
        if (err) {
          return next(err);
        }

        if (!user) {
          var error = new Error('User not found');
          error.status = 404;
          return next(error)
        }

        user = _.merge(user, body);
        user.save(function(err) {
          if (err) {
            return next(err);
          }

          res.json(jsonResponse.parseObject(user));
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


    res.json(jsonResponse.parseObject(user));
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

    res.json(jsonResponse.parseObject(user));
  });
});

module.exports = router;
