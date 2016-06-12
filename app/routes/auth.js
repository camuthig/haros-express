var express = require('express');
var router = express.Router();
var passport = require('passport');
var JwtService = require('../services/jwt');

jwt = new JwtService();

router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/' }),
  function(req, res, next) {
    var token = jwt.createToken(req.user);
    res.json({token:token});
  }
);

module.exports = router;
