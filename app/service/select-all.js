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
 */

'use strict'

const _      = require('lodash')

const args   = require('app/args')
const db     = require('app/db')
const logger = require('app/logger').getLogger('dds.service')


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