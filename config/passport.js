var passport       = require('passport');
var GoogleStrategy = require('passport-google-oauth20').Strategy;
var User           = require('../app/models/user');

module.exports = function (app, config) {

  // =========================================================================
  // passport session setup ==================================================
  // =========================================================================
  // required for persistent login sessions
  // passport needs ability to serialize and unserialize users out of session

  // used to serialize the user for the session
  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  // used to deserialize the user
  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });


  // Configure the JWT Strategy
  var JwtStrategy = require('passport-jwt').Strategy,
      ExtractJwt = require('passport-jwt').ExtractJwt;
  var opts = {}
  opts.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme('Bearer');
  opts.secretOrKey = config.get('auth.jwt.secret');
  passport.use(new JwtStrategy(opts, function(jwtPayload, done) {
      done(null, jwtPayload.user);
  }));

    
  // Use the GoogleStrategy within Passport.
  passport.use(new GoogleStrategy({
      clientID: config.get('auth.google.clientID'),
      clientSecret: config.get('auth.google.clientSecret'),
      callbackURL: config.get('auth.google.callbackUrl')
    },
    function(accessToken, refreshToken, profile, done) {
      User.findOne({ 'google.id' : profile.id }, function(err, user) {
        if (err) {
          return done(err);
        }

        if (user) {

          // if there is a user id already but no token (user was linked at one point and then removed)
          if (!user.google.token) {
            user.name                = profile.displayName;
            user.email               = (profile.emails[0].value || '').toLowerCase();

            user.google.token        = accessToken;
            user.google.refreshToken = refreshToken;
            user.google.name         = user.name;
            user.google.email        = user.email;

            user.save(function(err) {
                if (err)
                    return done(err);
                    
                return done(null, user);
            });
          }

            return done(null, user);
        } else {
          var newUser          = new User();
          newUser.name                = profile.displayName;
          newUser.email               = (profile.emails[0].value || '').toLowerCase();

          newUser.google.id           = profile.id;
          newUser.google.token        = accessToken;
          newUser.google.refreshToken = refreshToken;
          newUser.google.name         = newUser.name;
          newUser.google.email        = newUser.email;

          newUser.save(function(err) {
            if (err)
                return done(err);
                
            return done(null, newUser);
          });
        }
      }
    );
  })
)}