/*
 * danceDisplaySql - https://github.com/dance-display-sql/dance-display-sql.git
 *
 * Copyright (c) 2017 dance-display-sql
 */

/**
 * @module dds/router/mysql
 *
 * @requires express
 * @requires dds/executor
 * @requires dds/service/show-databases
 */

'use strict';

const express = require('express');

const executor      = require('app/executor')
const showDatabases = require('app/service/show-databases')
const selectById    = require('app/service/select-by-id')

//
// Router: /mysql
//
const router = express.Router({
  caseSensitive: true,
  mergeParams: true,
  strict: true
});

//
// Endpoints...
//

/**
 * @api {get} /mysql/show/databases Get Databases
 * @apiName GetDatabases
 * @apiGroup Mysql
 * @apiDescription Returns a list of databases
 * @apiParam {String} [pattern] a filter pattern. All `*` are replaced with `%`.
 * @apiVersion 0.0.1
 * @apiExample {curl} Example usage:
 *     curl -i http://localhost:3000/mysql/show/databases
 *     curl -i http://localhost:3000/mysql/show/databases?pattern=Test*DB
 *
 * @apiSuccess {String} status always `okay`
 * @apiSuccess {[]String} database an array with databases' names.
 *
 * @apiSuccessExample {json} Success response
 *     HTTP/1.1 200 OK
 *     {
 *       "status": "okay",
 *       "databases": [
 *          "database1",
 *          "database2",
 *          "database3"
 *       ]
 *     }
 */
router.get('/show/databases', function (req, res) {
  executor.execute(req, res, function (sender) {
    /** @type {ShowDatabasesOptions} */
    const options = {
      pattern: req.query.pattern
    };
    sender(showDatabases.execute(options), 'databases');
  });
});

/**
 * @api {get} /mysql/getById Get Item By id
 * @apiName GetItemById
 * @apiGroup Mysql
 * @apiDescription Returns the requested object, selected by its id
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
router.get('/getById', function (req, res) {
  executor.execute(req, res, function (sender) {
    /** @type {SelectByIdOptions} */
    const options = {
      object: req.query.object,
      id: req.query.id,
      extended: ['true', '1', 'yes'].indexOf((req.query.extended || '').toLowerCase()) >= 0,
      fields: (req.query.fields || '*').split(',')
    }
    sender(selectById.execute(options), 'result')
  })
})

//
// Exports the router
//
module.exports = router;
