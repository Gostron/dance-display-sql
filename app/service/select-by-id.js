/*
 * danceDisplaySql - https://github.com/dance-display-sql/dance-display-sql.git
 *
 * Copyright (c) 2017 dance-display-sql
 */

/**
 * @module dds/service/select-by-id
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
 * @name SelectByIdOptions
 * @property {string} [object] the type of object
 * @property {integer} [id] the id
 * @property {boolean} [extended] sets the mode (extended or simple) for the query
 * @property {array} [fields] fields to select
 */

/**
 * Query statement for the simple mode
 * @type {object}
 */
const SQL_SELECT_BY_ID_OBJECTS_TABLES = {
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
const SQL_SELECT_BY_ID_SIMPLE =
  'SELECT {fields} FROM {{table}} WHERE id = {id}'


/**
 * Query statement for the extended mode
 * @type {string}
 */
const SQL_SELECT_BY_ID_EXTENDED =
  'SELECT {fields} FROM {{table}} WHERE id = {id}'


/**
 *
 * @param {SelectByIdOptions} options
 * @return {promise} the promise callback with the object queried as parameter.
 */
module.exports.execute = function (options) {
  // Input handling
  if (!options.id) return Promise.reject("An 'id' must be given")
  if (!options.object) return Promise.reject("An object type must be given")
  const table = SQL_SELECT_BY_ID_OBJECTS_TABLES[options.object]
  if (!table) return Promise.reject("The object given is unknown. Values are: " + Object.keys(SQL_SELECT_BY_ID_OBJECTS_TABLES).join(', '))

  // SQL Querying
  return db.getConnection()
    .then(function (conn) {
      // TODO extended mode (headache incoming..)
      const parameters = {
        fields: '*',
        table: table,
        id: options.id
      }
      return conn.query(SQL_SELECT_BY_ID_EXTENDED, parameters)
        .then(function (results) {
          return results
        })
        .finally(function () {
          conn.release()
        })
    })
}