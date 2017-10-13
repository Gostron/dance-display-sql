/*
 * danceDisplaySql - https://github.com/dance-display-sql/dance-display-sql.git
 *
 * Copyright (c) 2017 dance-display-sql
 */

/**
 * @module dds/router/auth
 *
 * @requires express
 * @requires dds/executor
 */

'use strict'

const express  = require('express')

const executor = require('app/executor')

module.exports = function (passport) {
//
// Router: /auth
//
const router = express.Router({
  caseSensitive: true,
  mergeParams: true,
  strict: true
})

//
// Endpoints...
//
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }))
router.get('/google/callback', passport.authenticate('google', {
  scope: ['profile', 'email'],
  successRedirect: '/auth/profile',
  failureRedirect: '/auth/google'
}))

router.get('/twitter', passport.authenticate('twitter', { scope: ['include_email=true'] }))
router.get('/twitter/callback', passport.authenticate('twitter', {
  successRedirect: '/auth/profile',
  failureRedirect: '/auth/twitter'
}))

router.get('/facebook', passport.authenticate('facebook', { scope: "email" }))
router.get('/facebook/callback', passport.authenticate('facebook', {
  successRedirect: '/auth/profile',
  failureRedirect: '/auth/facebook'
}))

router.get('/profile', function (req, res) {
  executor.execute(req, res, function (sender) {
    sender(new Promise((resolve) => { resolve(req.user) }), 'result')
  })
})

//
// Exports the router
//
return router
}