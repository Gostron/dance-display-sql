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

  // used to serialize the user for the session
  passport.serializeUser(function(user, done) {
    console.log({ logFrom: 'serializeUser', log: user })
    var propertyToSerialize = {
      'google': 'googleId',
      'twitter': 'twitterId',
      'facebook': 'facebookId'
    }
    done(null, user.id)
  })

  // used to deserialize the user
  passport.deserializeUser(function(id, done) {
    mysql.getUser({
      authType: 'sql',
      key: id
    }).then(function (result) {
      done(null, result)
    }, function (reason) {
      done(reason, null)
    }).catch(function (err) {
      done(err, null)
    })
  })

  // code for login (use('local-login', new LocalStategy))
  // code for signup (use('local-signup', new LocalStategy))

  // =========================================================================
  // FACEBOOK ================================================================
  // =========================================================================
  passport.use(new FacebookStrategy(
    {
      clientID          : configAuth.facebookAuth.clientID,
      clientSecret      : configAuth.facebookAuth.clientSecret,
      callbackURL       : configAuth.facebookAuth.callbackURL,
      passReqToCallback : true
    },
    function(req, token, refreshToken, profile, done) {

      console.log(req.user)

      var user = {
        provider: 'facebook',
        facebookId: profile.id,
        facebookToken: token,
        facebookName: profile.name.givenName + ' ' + profile.name.familyName,
        facebookEmail: (profile.emails || [{}])[0].value
      }

      process.nextTick(function() {
        mysql.getUser({
          authType: 'facebook',
          key: profile.id
        }).then(function (result) {
          if (!result || result.length < 1) {
            mysql.addUser({
              authType: 'facebook',
              currentUser: (req.user || {}).id,
              properties: user
            }).then(function (result) {
              done(null, Object.assign({}, result, { provider: 'google' }))
            }, function (reason) {
              done(reason, null)
            }).catch(function (err) {
              done(err, null)
            })
          } else {
            done(null, Object.assign({}, result, { provider: 'facebook' }))
          }
        }, function (reason) {
          done(reason, null)
        }).catch(function (err) {
          done(err, null)
        })
      })
    })
  )

  // =========================================================================
  // TWITTER =================================================================
  // =========================================================================
  passport.use(new TwitterStrategy(
    {
      consumerKey       : configAuth.twitterAuth.consumerKey,
      consumerSecret    : configAuth.twitterAuth.consumerSecret,
      callbackURL       : configAuth.twitterAuth.callbackURL,
      includeEmail      : true,
      passReqToCallback : true
    },
    function(req, accessToken, refreshToken, profile, done) {

      console.log(req.user)

      var user = {
        provider: 'twitter',
        twitterId: profile.id,
        twitterToken: accessToken,
        twitterName: profile.username,
        twitterDisplayName: profile.displayName
      }

      process.nextTick(function() {
        mysql.getUser({
          authType: 'twitter',
          key: profile.id
        }).then(function (result) {
          if (!result || result.length < 1) {
            mysql.addUser({
              authType: 'twitter',
              currentUser: (req.user || {}).id,
              properties: user
            }).then(function (result) {
              done(null, Object.assign({}, result, { provider: 'google' }))
            }, function (reason) {
              done(reason, null)
            }).catch(function (err) {
              done(err, null)
            })
          } else {
            done(null, Object.assign({}, result, { provider: 'twitter' }))
          }
        }, function (reason) {
          done(reason, null)
        }).catch(function (err) {
          done(err, null)
        })
      })
    })
  )

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
    function(req, token, refreshToken, profile, done) {

      console.log(req.user)

      var user = {
        provider: 'google',
        googleId: profile.id,
        googleToken: token,
        googleName: profile.displayName,
        googleEmail: profile.emails[0].value
      }

      process.nextTick(function() {
        mysql.getUser({
          authType: 'google',
          key: profile.id
        }).then(function (result) {
          if (!result || result.length < 1) {
            mysql.addUser({
              authType: 'google',
              currentUser: (req.user || {}).id,
              properties: user
            }).then(function (result) {
              done(null, Object.assign({}, result, { provider: 'google' }))
            }, function (reason) {
              done(reason, null)
            }).catch(function (err) {
              done(err, null)
            })
          } else {
            done(null, Object.assign({}, result, { provider: 'google' }))
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