/*
 * danceDisplaySql - https://github.com/dance-display-sql/dance-display-sql.git
 *
 * Copyright (c) 2017 dance-display-sql
 */

/**
 * @module dds/service/select-all
 *
 * @requires lodash
 * @requires module:dds/args
 * @requires module:dds/db
 * @requires module:dds/logger
 * @requires node-mysql-nesting
 */

'use strict'

const _      = require('lodash')

const args   = require('app/args')
const db     = require('app/db')
const logger = require('app/logger').getLogger('dds.service')

const nester = require('node-mysql-nesting')

/**
 * @name SelectAllOptions
 * @property {string} [object] the type of object
 * @property {integer} [number] the maximum number of results
 * @property {integer} [minId] the minimum id (pagination)
 * @property {array} [fields] fields to select
 */

/**
 * List of known object types
 * @type {object}
 */
const SQL_SELECT_ALL_OBJECTS_TABLES = {
  'competition': 'competition',
  'contestant': 'contestant',
  'couple': 'couple',
  'category': 'category',
  'judge': 'judge',
  'mark': 'mark',
  'event': 'event',
  'progress': 'progress',
  'dance': 'dance',
  'template': 'template',
  'subtemplate': 'subtemplate',
  'stage': 'stage',
  'age': 'age'
}

/**
 * Query statement for the simple mode
 * @type {string}
 */
const SQL_SELECT_ALL =
  'SELECT {{fields}} FROM {{table}} WHERE id > {id} LIMIT {results}'


const SQL_VIEW_LIST = {
  // REF_TEMPLATE QUERY
  ref_template: {
    sql: 'SELECT * FROM ref_template\
      LEFT JOIN ref_subtemplate       ON ref_subtemplate.id_template          = ref_template.id\
      LEFT JOIN ref_subtemplate_dance ON ref_subtemplate_dance.id_subtemplate = ref_subtemplate.id\
      LEFT JOIN ref_dance             ON ref_dance.id                         = ref_subtemplate_dance.id_dance',
    nestTables: true,
    nestingOptions: [
      { tableName: 'ref_template',pkey: 'id' },
      { tableName: 'ref_subtemplate',pkey: 'id', fkeys: [{ table: 'ref_template', col: 'id_template' }] },
      { tableName: 'ref_subtemplate_dance',pkey: 'id', fkeys: [{ table: 'ref_subtemplate', col: 'id_subtemplate' }, {table: 'ref_dance', col: 'id_dance' }] },
      { tableName: 'ref_dance',pkey: 'id' }
    ]
  },
  // CATEGORY QUERY
  category: {
    sql: 'SELECT * FROM category\
      LEFT JOIN competition                  ON competition.id                    = category.id_competition\
      LEFT JOIN category_dance               ON category_dance.id_category        = category.id\
      LEFT JOIN category_judge               ON category_judge.id_category        = category.id\
      LEFT JOIN category_subscription        ON category_subscription.id_category = category.id\
      LEFT JOIN competition_couple           ON competition_couple.id             = category_subscription.id_couple\
      LEFT JOIN couple                       ON couple.id                         = competition_couple.id_couple\
      LEFT JOIN contestant contestant_male   ON couple.id_male                    = contestant_male.id\
      LEFT JOIN contestant contestant_female ON couple.id_female                  = contestant_female.id',
    nestTables: true,
    nestingOptions: [
      { tableName: 'category',              pkey: 'id', fkeys: [{ table: 'competition', col: 'id_competition' }]},
      { tableName: 'competition',           pkey: 'id'},
      { tableName: 'category_dance',        pkey: 'id', fkeys: [{ table: 'category', col: 'id_category' }]},
      { tableName: 'category_judge',        pkey: 'id', fkeys: [{ table: 'category', col: 'id_category' }, { table: 'judge', col: 'id_judge' }]},
      { tableName: 'category_subscription', pkey: 'id', fkeys: [{ table: 'category', col: 'id_category' }, { table: 'competition_couple', col: 'id_couple' }]},
      { tableName: 'competition_couple',    pkey: 'id', fkeys: [{ table: 'couple', col: 'id_couple' }]},
      { tableName: 'couple',                pkey: 'id', fkeys: [{ table: 'contestant_male', col: 'id_male' }, { table: 'contestant_female', col: 'id_female' }]},
      { tableName: 'contestant_male',       pkey: 'id'},
      { tableName: 'contestant_female',     pkey: 'id'}
    ]
  }
}


const SQL_VIEW_TEST_NESTING_OPTIONS = [
  { tableName: 'ref_template',pkey: 'id' },
  { tableName: 'ref_subtemplate',pkey: 'id', fkeys: [{ table: 'ref_template', col: 'id_template' }] },
  { tableName: 'ref_subtemplate_dance',pkey: 'id', fkeys: [{ table: 'ref_subtemplate', col: 'id_subtemplate' }, {table: 'ref_dance', col: 'id_dance' }] },
  { tableName: 'ref_dance',pkey: 'id' }
]
/**
 *
 * @param {SelectAllOptions} options
 * @return {promise} the promise callback with the object queried as parameter.
 */
module.exports.execute = function (options) {
  // Input handling
  if (!options.object) return Promise.reject("An object type must be given")
  const table = SQL_SELECT_ALL_OBJECTS_TABLES[options.object]
  if (!table) return Promise.reject("The object given is unknown. Values are: " + Object.keys(SQL_SELECT_ALL_OBJECTS_TABLES).join(', '))

  var id = options.id || 0
  var results = Math.min(100, (options.results || 100))

  // SQL Querying
  return db.getConnection()
    .then(function (conn) {
      // TODO extended mode (headache incoming..)
      const parameters = {
        fields: '*',
        table: table,
        id: id,
        results: results
      }
      return conn.query(SQL_SELECT_ALL, parameters)
        .then(function (results) {
          return results
        })
        .finally(function () {
          conn.release()
        })
    })
}

/**
 *
 * @param {SelectAllOptions} options
 * @return {promise} the promise callback with the object queried as parameter.
 */
module.exports.testView = function () {
  // SQL Querying
  return db.getConnection()
    .then(function (conn) {
      return conn.query({ sql: SQL_VIEW_TEST, nestTables: true })
        .then(function (results) {
          return nester.convertToNested(results, SQL_VIEW_TEST_NESTING_OPTIONS)
        })
        .finally(function () {
          conn.release()
        })
    })
}