var express = require('express');
var router = express.Router();
var passport = require('passport');
var JwtService = require('../services/jwt');
var GatewayService = require('../services/gateway');

jwt = new JwtService();
gateway = new GatewayService();

router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/' }),
  function(req, res) {
    return gateway.getPermissions(req.user).then(function(perms) {
      var token = jwt.createToken(req.user, perms);
      res.json({token:token});
    }, function(err) {
      res.json({err: 'shiz'});
    });
  });

module.exports = router;
