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

const router = express.Router({
  caseSensitive: true,
  mergeParams: true,
  strict: true
})

router.get('/test/:object', function (req, res) {
  executor.execute(req, res, function (sender) {
    sender(selectAll.testView(req.params), 'results')
  })
})

/**
 * @apiDefine OBJECT
 * @apiParam {String=category, competition, contestant, couple, event, judge, stage} object **URL** - the object type.
 */

/**
 * @apiDefine REFERENCE
 * @apiParam {String=ref_age, ref_clearance, ref_dance, ref_notationMode, ref_stage, ref_template} reference **URL** - the reference type.
 */

/**
 * @apiDefine Objects Object Manipulation
 * The calls in this category allow users CRUD methods
 * to interact with the model
 */

/**
 * @api {post} /api/:object/new Create a new object (global)
 * @apiGroup Objects
 * @apiVersion 0.0.1
 * @apiName NewGlobalItem
 * @apiDescription Restricted to : **Administrator**
 * <br>Exception : a **Host** can create a `competition`
 *
 * Properties expected for each object type:
 *
 *    Object    | Properties
 * ------------ | ----------
 * age          | name
 * competition  | date_begin, date_end, name, subname*
 * contestant   | firstname, lastname, birthdate*
 * couple       | id_male, id_female
 * dance        | name
 * judge        | firstname, lastname, country*
 * stage        | name, has_notes*
 * template     | name
 * subtemplate  | name
 *
 * Properties with an __asterisk*__ are optional
 *
 * @apiUse OBJECT
 * @apiParam {Boolean}  [extended=false]  **URL parameter** - Sets the mode (extended or simple) for the query
 * @apiParam {Array}    properties        **Body** - the properties of the object to create
 */
router.get('/:object/new', function (req, res) {
  executor.execute(req, res, function (sender) {
    /** @type {SelectByIdOptions} */
    const options = {
      object: req.params.object,
      values: req.body
    }
    sender(insertNew.execute(options), 'result')
  })
})

/**
 * @api {get} /api/:object/:id Get the object requested (global)
 * @apiGroup Objects
 * @apiVersion 0.0.1
 * @apiName GetGlobalItem
 * @apiDescription This method returns the requested object, selected by its id, if it exists.
 * <br>See the new object method for a detailled list of properties returned for each object.
 * <br><br>The extended mode allows for additional properties returned, mainly related items.
 * For example, if a competition in extended mode is requested, its progress, couples, events, categories and judges will be returned.
 *
 * Additional properties return for each object type:
 *
 *    Object    | Properties
 * ------------ | ----------
 * age          | N/a
 * competition  | progress, lists of couples, events, categories, judges
 * contestant   | N/a
 * couple       | the male and female contestants
 * dance        | N/a
 * judge        | N/a
 * stage        | N/a
 * template     | the list of subtemplates
 * subtemplate  | the list of dances
 *
 * NB: the additional objects return in extended mode are **not** extended themselves.
 *
 * @apiUse OBJECT
 * @apiParam {integer}  id                **URL** - the id of the object.
 * @apiParam {Boolean}  [extended=false]  **URL parameter** - Sets the mode (extended or simple) for the query.
 * @apiParam {Array}    [fields=*]        **URL parameter** - Reduces the properties returned to the one requested.
 */
/**
 * @api {post} /api/:object/:id Update an existing object (global)
 * @apiGroup Objects
 * @apiVersion 0.0.1
 * @apiName UpdateGlobalItem
 * @apiDescription See the new object method for a detailled list of properties expected for each object.
 * <br>Restricted to : **Administrator**
 * <br>Exception : a **Host** can create a `competition`
 *
 * @apiUse OBJECT
 * @apiParam {integer}  id          **URL** - the id of the object.
 * @apiParam {Array}    [fields=*]  **URL parameter** - Reduces the properties returned to the one requested.
 */
/**
 * @api {delete} /api/:object/:id Deletes the requested object (global)
 * @apiGroup Objects
 * @apiVersion 0.0.1
 * @apiName DeleteGlobalItem
 * @apiDescription Restricted to : **Administrator**
 * <br>__NB__: a **Host** cannot delete a `competition`
 *
 * @apiUse OBJECT
 * @apiParam {integer}  id          **URL** - the id of the object.
 */
router.all('/:object/:id', function (req, res) {
  switch (req.method) {
    case "GET":
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
      return
    case "POST":
      executor.execute(req, res, function (sender) {
      })
      return
    case "DELETE":
      executor.execute(req, res, function (sender) {
      })
      return
    default:
      next()
  }
})

/**
 * @api {get} /api/:object Get the list of objects requested (global)
 * @apiGroup Objects
 *
 * @apiVersion 0.0.1
 *
 * @apiDescription Allows to list global objects, with a limit of `results`
 *
 * @apiName GetGlobalItems
 *
 * @apiUse OBJECT
 * @apiParam {Integer} [first=0]          **URL parameter** - the minimum id of the object (not included)
 * @apiParam {Integer} [results=30]       **URL parameter** - the maximum number of results (100 maximum)
 * @apiParam {Boolean} [extended=false]   **URL parameter** - Sets the mode (extended or simple) for the query.
 * @apiParam {Array}   [fields=*]         **URL parameter** - Reduces the properties returned to the one requested.
 */
/**
 * @api {get} /api/:object Get the list of objects requested (global)
 * @apiGroup Objects
 *
 * @apiVersion 0.0.1
 *
 * @apiDescription Allows to list global objects, with a limit of `results`
 *
 * @apiName GetGlobalItems
 *
 * @apiUse REFERENCE
 * @apiParam {Integer} [first=0]          **URL parameter** - the minimum id of the object (not included)
 * @apiParam {Integer} [results=30]       **URL parameter** - the maximum number of results (100 maximum)
 * @apiParam {Boolean} [extended=false]   **URL parameter** - Sets the mode (extended or simple) for the query.
 * @apiParam {Array}   [fields=*]         **URL parameter** - Reduces the properties returned to the one requested.
 */
router.get('/reference/:reference', function (req, res) {
  executor.execute(req, res, function (sender) {
    /** @type {SelectAllOptions} */
    const options = {
      object: req.params.reference,
      id: req.query.first,
      fields: (req.query.fields || '*').split(','),
      results: req.query.results
    }
    sender(selectAll.execute(options), 'results')
  })
})


/**
 * @apiDefine Associations Objects associations
 * The calls in this category allow users CRUD methods
 * to bind elements to others, allowing to construct the model
 */

/**
 * @apiDefine Permissions User clearance management
 * The calls in this category allow users to give or remove
 * authorizations for users
 */

module.exports = router