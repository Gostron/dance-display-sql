/*
 * danceDisplaySql - https://github.com/dance-display-sql/dance-display-sql.git
 *
 * Copyright (c) 2017 dance-display-sql
 */

/**
 * @module dds/router/auth
 *
 * @requires passport-local
 * @requires passport-facebook
 * @requires passport-twitter
 * @requires passport-google-oauth2
 * @requires module:dds/service/user-management
 */

'use strict'


// load all the things we need
var LocalStrategy      = require('passport-local').Strategy
var FacebookStrategy   = require('passport-facebook').Strategy
var TwitterStrategy    = require('passport-twitter').Strategy
var GoogleStrategy     = require('passport-google-oauth2').Strategy

const mysql            = require('app/service/user-management')

// load the auth variables
const configAuth       = require('./config')

module.exports = function (passport) {

  /*
  // used to serialize the user for the session
  passport.serializeUser(function(user, done) {
    done(null, user.id)
  })

  // used to deserialize the user
  passport.deserializeUser(function(id, done) {
    mysql.getUser({
      authType: 'google',
      key: id
    }).then(function (result) {
      done(null, result)
    }, function (reason) {
      done(reason, null)
    }).catch(function (err) {
      done(err, null)
    })
  })*/

  // code for login (use('local-login', new LocalStategy))
  // code for signup (use('local-signup', new LocalStategy))
  // code for facebook (use('facebook', new FacebookStrategy))
  // code for twitter (use('twitter', new TwitterStrategy))

  // =========================================================================
  // GOOGLE ==================================================================
  // =========================================================================
  passport.use(new GoogleStrategy(
    {
      clientID          : configAuth.googleAuth.clientID,
      clientSecret      : configAuth.googleAuth.clientSecret,
      callbackURL       : configAuth.googleAuth.callbackURL,
      passReqToCallback : true
    },
    function(token, refreshToken, profile, done) {
      // make the code asynchronous
      // User.findOne won't fire until we have all our data back from Google
      process.nextTick(function() {
        mysql.getUser({
          authType: 'google',
          key: profile.id
        }).then(function (result) {
          console.log(result)
          if (!result || result.length < 1) {
            mysql.addUser({
              authType: 'google',
              properties: {
                googleId: profile.id,
                googleToken: token,
                googleName: profile.displayName,
                googleEmail: profile.emails[0].value
              }
            }).then(function (result) {
              done(null, result)
            }, function (reason) {
              done(reason, null)
            }).catch(function (err) {
              done(err, null)
            })
          } else {
            done(null, result)
          }
        }, function (reason) {
          done(reason, null)
        }).catch(function (err) {
          done(err, null)
        })
      })
    })
  )
}