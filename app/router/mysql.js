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
 * @requires dds/service/insert-new
 * @requires dds/service/select-by-id
 * @requires dds/service/select-all
 */

'use strict'

const express = require('express')

const executor      = require('app/executor')
const insertNew     = require('app/service/insert-new')
const selectById    = require('app/service/select-by-id')
const selectAll     = require('app/service/select-all')

//
// Router: /api
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
 * @api {get} /api/getById Get Item By id
 * @apiName GetItemById
 * @apiGroup Mysql
 * @apiDescription Returns the requested object, selected by its id
 * @apiParam {String} [object] the type of the object.
 * @apiParam {Integer} [id] the id of the object
 * @apiParam {Boolean} [extended] Sets the mode (extended or simple) for the query
 * @apiParam {Array} [fields] the fields to be returned
 * @apiVersion 0.0.1
 * @apiExample {curl} Example usage:
 *     curl -i http://localhost:3000/api/getById?id=23&object=contestant
 *     curl -i http://localhost:3000/api/show/databases?id=5123&object=mark&fields=notation
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

/**
 * @api {get} /api/getAll Get All
 * @apiName GetAll
 * @apiGroup Mysql
 * @apiDescription Returns the requested objects, ordered by id
 * @apiParam {String} [object] the type of the object.
 * @apiParam {Integer} [id] the minimum id of the object (not included)
 * @apiParam {Integer} [results] the maximum number of results (100 maximum)
 * @apiParam {Array} [fields] the fields to be returned
 * @apiVersion 0.0.1
 * @apiExample {curl} Example usage:
 *     curl -i http://localhost:3000/api/getAll?object=contestant
 *     curl -i http://localhost:3000/api/getAll?object=contestant&id=31&results=30
 *
 * @apiSuccess {Object} result the object request
 *
 * @apiSuccessExample {json} Success response
 *     HTTP/1.1 200 OK
 *     {
 *       "results": [
 *         {
  *          id: 32,
  *          firstname: 'John',
  *          lastname: 'Doe',
  *          birthdate: '1900-01-01 00:00:01'
 *         }, {
  *          id: 33,
  *          firstname: 'Jane',
  *          lastname: 'Doe',
  *          birthdate: '1900-01-01 00:00:02'
 *         }
 *       ]
 *     }
 */
router.get('/getAll', function (req, res) {
  executor.execute(req, res, function (sender) {
    /** @type {SelectAllOptions} */
    const options = {
      object: req.query.object,
      id: req.query.id,
      fields: (req.query.fields || '*').split(','),
      results: req.query.results
    }
    sender(selectAll.execute(options), 'results')
  })
})

/**
 * @api {get} /api/insertNew Insert new
 * @apiName InsertNew
 * @apiGroup Mysql
 * @apiDescription Inserts new values of the object type requested
 * @apiParam {String} [object] the type of the objcts
 * @apiParam {Array} [fields] the values to insert
 * @apiVersion 0.0.1
 * @apiExample {curl} Example usage:
 *     curl -i http://localhost:3000/api/insertNew?object=contestant -X POST -d "firstname":"John","lastname":"Doe","birthdate":"1900/01/01 00:00:01"
 *
 * @apiSuccess {Object} result the result returned
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
router.post('/insertNew', function (req, res) {
  executor.execute(req, res, function (sender) {
    /** @type {SelectByIdOptions} */
    const options = {
      object: req.query.object,
      values: req.body
    }
    sender(insertNew.execute(options), 'result')
  })
})

//
// Exports the router
//
module.exports = router