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

/**
 * @api {get} /auth/google Authenticate against google
 * @apiName GoogleAuth
 * @apiGroup Authentication
 * @apiDescription Allows to authenticate against google
 * @apiParam {String} [object] the type of the object.
 * @apiParam {Integer} [id] the id of the object
 * @apiParam {Boolean} [extended] Sets the mode (extended or simple) for the query
 * @apiParam {Array} [fields] the fields to be returned
 * @apiVersion 0.0.1
 * @apiExample {curl} Example usage:
 *     curl -i http://localhost:3000/mysql/getById?id=23&object=contestant
 *     curl -i http://localhost:3000/mysql/show/databases?id=5123&object=mark&fields=notation
 *
 * @apiSuccess {Object} result the object request
 *
 * @apiSuccessExample {json} Success response
 *     HTTP/1.1 200 OK
 *     {
 *       "result": {
 *         id: 23,
 *         firstname: 'John',
 *         lastname: 'Doe',
 *         birthdate: '1900-01-01 00:00:01'
 *       }
 *     }
 */
const scope = ['profile', 'email']

router.get('/google', passport.authenticate('google', { scope: scope }))

router.get('/google/callback', passport.authenticate('google', {
  scope: scope,
  successRedirect: '/auth/google/profile',
  failureRedirect: '/auth/google'
}))

router.get('/google/profile', function (req, res) {
  executor.execute(req, res, function (sender) {
    sender(new Promise((resolve) => { resolve(req.user) }), 'result')
  })
})

//
// Exports the router
//
return router
}