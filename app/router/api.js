/*
 * danceDisplaySql - https://github.com/dance-display-sql/dance-display-sql.git
 *
 * Copyright (c) 2017 dance-display-sql
 */

/**
 * @module dds/router/api
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
 * @api {get} /api/:object/get/:id Get Item By id
 * @apiName GetItemById
 * @apiGroup API
 * @apiDescription Returns the requested object, selected by its id
 * @apiParam {String} [object] the type of the object.
 * @apiParam {Integer} [id] the id of the object
 * @apiParam {Boolean} [extended] Sets the mode (extended or simple) for the query
 * @apiParam {Array} [fields] the fields to be returned
 * @apiVersion 0.0.1
 * @apiExample {curl} Example usage:
 *     curl -i http://localhost:3000/api/contestant/get/23
 *     curl -i http://localhost:3000/api/mark/get/514?fields=notation,id
 *
 * @apiSuccess {Object} result the object request
 *
 * @apiSuccessExample {json} Success response
 *     {
 *       "result": {
 *         id: 23,
 *         firstname: 'John',
 *         lastname: 'Doe',
 *         birthdate: '1900-01-01 00:00:01'
 *       }
 *     }
 */
router.get('/:object/get/:id', function (req, res) {
  executor.execute(req, res, function (sender) {
    /** @type {SelectByIdOptions} */
    const options = {
      object: req.params.object,
      id: req.params.id,
      extended: ['true', '1', 'yes'].indexOf((req.query.extended || '').toLowerCase()) >= 0,
      fields: (req.query.fields || '*').split(',')
    }
    sender(selectById.execute(options), 'result')
  })
})

/**
 * @api {get} /api/:object/get Get All objects
 * @apiName GetAllItems
 * @apiGroup API
 * @apiDescription Returns the requested objects, ordered by id
 * @apiParam {String} [object] the type of the object.
 * @apiParam {Integer} [first] the minimum id of the object (not included)
 * @apiParam {Integer} [results] the maximum number of results (100 maximum)
 * @apiParam {Array} [fields] the fields to be returned
 * @apiVersion 0.0.1
 * @apiExample {curl} Example usage:
 *     curl -i http://localhost:3000/api/contestant/get
 *     curl -i http://localhost:3000/api/mark/get?first=31&results=30
 *
 * @apiSuccess {Object} result the object request
 *
 * @apiSuccessExample {json} Success response
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
router.get('/:object/get', function (req, res) {
  executor.execute(req, res, function (sender) {
    /** @type {SelectAllOptions} */
    const options = {
      object: req.params.object,
      id: req.query.first,
      fields: (req.query.fields || '*').split(','),
      results: req.query.results
    }
    sender(selectAll.execute(options), 'results')
  })
})

/**
 * @api {get} /api/:object/:id/add Adds an object associated with the selected object
 * @apiName AddLookup
 * @apiGroup API
 * @apiDescription Returns validation about the objects created
 * @apiParam {String} [object] the type of the object to associated objects with
 * @apiParam {Integer} [id] the id of the object to associate objects with
 * @apiParam {String} [typeToCreate] The type of the object that will be created
 * @apiParam {Array} [fields] the fields to be returned
 * @apiVersion 0.0.1
 * @apiExample {curl} Example usage:
 *     curl -i http://localhost:3000/api/contestant/get
 *     curl -i http://localhost:3000/api/mark/get?first=31&results=30
 *
 * @apiSuccess {Object} result the object request
 *
 * @apiSuccessExample {json} Success response
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
router.get('/:object/:id/add', function (req, res) {
  executor.execute(req, res, function (sender) {
    /** @type {SelectAllOptions} */
    const options = {
      object: req.params.object,
      id: req.query.first,
      fields: (req.query.fields || '*').split(','),
      results: req.query.results
    }
    sender(selectAll.execute(options), 'results')
  })
})

/**
 * @api {post} /api/:object/new Create a new object
 * @apiName InsertNew
 * @apiGroup API
 * @apiDescription Inserts new values of the object type specified
 * @apiParam {String} [object] the type of the objcts
 * @apiParam {Array} [fields] the values to insert
 * @apiVersion 0.0.1
 * @apiExample {curl} Example usage:
 *     curl -i http://localhost:3000/api/contestant/new -X POST -d "firstname":"John","lastname":"Doe","birthdate":"1900/01/01 00:00:01"
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
router.post('/:object/new', function (req, res) {
  executor.execute(req, res, function (sender) {
    /** @type {SelectByIdOptions} */
    const options = {
      object: req.params.object,
      values: req.body
    }
    sender(insertNew.execute(options), 'result')
  })
})

//
// Exports the router
//
module.exports = router