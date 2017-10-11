/*
 * danceDisplaySql - https://github.com/dance-display-sql/dance-display-sql.git
 *
 * Copyright (c) 2017 dance-display-sql
 */

/**
 * @module dds/service/user-management
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
 * @name UserManagementGetOptions
 * @property {string} [authType] type of authentication (Google, Facebook, Twitter, Local)
 * @property {string} [key] unique user identifier
 */


/**
 * @name UserManagementSetOptions
 * @property {string} [authType] type of authentication (Google, Facebook, Twitter, Local)
 * @property {object} [properties] properties
 */


/**
 * List of authentications
 * @type {object}
 */
const SQL_USER_MANAGEMENT_AUTH_TABLES = {
  'google': 'user_google'
}


/**
 * Query statement
 * @type {string}
 */
const SQL_USER_MANAGEMENT_GET =
  'SELECT INTO {{table}} WHERE {{key}} = {id} LIMIT 1'


/**
 * Query statement
 * @type {string}
 */
const SQL_USER_MANAGEMENT_SET =
  'INSERT INTO {{table}} SET {properties}'


/**
 *
 * @param {UserManagementGetOptions} options
 * @return {promise} the promise callback with the result of the query as parameter.
 */
module.exports.getUser = function (options) {
  // Input handling
  if (!options.key) return Promise.reject("A unique user key must be given")
  if (!options.authType) return Promise.reject("An authentication method must be given")
  const table = SQL_USER_MANAGEMENT_AUTH_TABLES[options.authType]
  if (!table) return Promise.reject("The authentication method is unknown. Values are: " + Object.keys(SQL_USER_MANAGEMENT_AUTH_TABLES).join(', '))

  // SQL Querying
  return db.getConnection()
    .then(function (conn) {
      const parameters = {
        key: 'googleId',
        table: table,
        id: options.id
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

/**
 *
 * @param {UserManagementSetOptions} options
 * @return {promise} the promise callback with the result of the query as parameter.
 */
module.exports.addUser = function (options) {
  // Input handling
  if (!options.key) return Promise.reject("A unique user key must be given")
  if (!options.authType) return Promise.reject("An authentication method must be given")
  options.table = SQL_USER_MANAGEMENT_AUTH_TABLES[options.authType]
  if (!options.table) return Promise.reject("The authentication method is unknown. Values are: " + Object.keys(SQL_USER_MANAGEMENT_AUTH_TABLES).join(', '))

  delete options.authType

  // SQL Querying
  return db.getConnection()
    .then(function (conn) {
      return conn.query(SQL_USER_MANAGEMENT_SET, options)
        .then(function (results) {
          return results
        })
        .finally(function () {
          conn.release()
        })
    })
}