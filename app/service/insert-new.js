/*
 * danceDisplaySql - https://github.com/dance-display-sql/dance-display-sql.git
 *
 * Copyright (c) 2017 dance-display-sql
 */

/**
 * @module dds/service/insert-new
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
 * @name InsertNewOptions
 * @property {string} [object] the type of object
 * @property {array} [values] values to insert in the table
 */

/**
 * List of known object types
 * @type {object}
 */
const SQL_INSERT_NEW_OBJECTS_TABLES = {
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
 * Query statement
 * @type {string}
 */
const SQL_INSERT_NEW =
  'INSERT INTO {{table}} ({{fields}}) VALUES {values}'


/**
 *
 * @param {InsertNewOptions} options
 * @return {promise} the promise callback with the reuslt of the query as parameter.
 */
module.exports.execute = function (options) {
  // Input handling
  if (!options.values || options.values.length < 1) return Promise.reject("The array of values must contain at least one value")
  var fields = Object.keys(options.values[0])
  if (!options.object) return Promise.reject("An object type must be given")
  const table = SQL_INSERT_NEW_OBJECTS_TABLES[options.object]
  if (!table) return Promise.reject("The object given is unknown. Values are: " + Object.keys(SQL_INSERT_NEW_OBJECTS_TABLES).join(', '))

  var values = _.map(options.values, function (v) { return _.map(fields, function (f) { return v[f] }) })
  console.log(values)

  // SQL Querying
  return db.getConnection()
    .then(function (conn) {
      const parameters = {
        fields: fields,
        table: table,
        values: values
      }
      return conn.query(SQL_INSERT_NEW, parameters)
        .then(function (results) {
          return results
        })
        .finally(function () {
          conn.release()
        })
    })
}