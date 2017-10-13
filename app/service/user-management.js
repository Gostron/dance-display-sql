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
 * @property {int} [currentUser] currentUserId if connected
 * @property {object} [properties] properties
 */


/**
 * List of authentications
 * @type {object}
 */
const SQL_USER_MANAGEMENT_AUTH_TABLES = {
  'google': 'user_google',
  'twitter': 'user_twitter',
  'facebook': 'user_facebook',
  'sql': 'user'
}


/**
 * List of authenticators keys (actual json propeties returned by them)
 * @type {object}
 */
const SQL_USER_MANAGEMENT_AUTH_KEYS = {
  'google': 'googleId',
  'twitter': 'twitterId',
  'facebook': 'facebookId',
  'sql': 'u.id'
}


/**
 * List of authentications keys (lookups from user towards authenticators tables)
 * @type {object}
 */
const SQL_USER_MANAGEMENT_USER_KEYS = {
  'google': 'id_google',
  'twitter': 'id_twitter',
  'facebook': 'id_facebook'
}


/**
 * Query statement for retrieving a user
 * @type {string}
 */
const SQL_USER_MANAGEMENT_GET = [
  'SELECT u.id',
  ', CASE',
    'WHEN COALESCE(c.firstname, j.firstname) IS NULL',
      'THEN COALESCE(googleName, twitterDisplayName, facebookName)',
      'ELSE CONCAT(COALESCE(c.firstname, j.firstname), " ", COALESCE(c.lastname, j.lastname))',
    'END AS name',
  ', COALESCE(googleEmail, facebookEmail) as email',
  ', birthdate',
  ', country',
  ', IF(googleId, true, false) as google_connected',
  ', IF(facebookId, true, false) as facebook_connected',
  ', IF(twitterId, true, false) as twitter_connected',
  'FROM user u',
  'LEFT JOIN contestant c ON u.id_contestant = c.id',
  'LEFT JOIN judge j ON u.id_judge = j.id',
  'LEFT JOIN user_google g ON u.id_google = g.id',
  'LEFT JOIN user_facebook f ON u.id_facebook = f.id',
  'LEFT JOIN user_twitter t ON u.id_twitter = t.id',
  'WHERE {{key}} = {id}',
  'LIMIT 1'
].join('\n')


/**
 *
 * @param {UserManagementGetOptions} options
 * @return {promise} the promise callback with the result of the query as parameter.
 */
function getUser (options) {
  // Input handling
  if (!options.key) return Promise.reject({ message: "getUser - A unique user key must be given", context: options })
  if (!options.authType) return Promise.reject({ message: "getUser - An authentication method must be given", context: options })
  const key = SQL_USER_MANAGEMENT_AUTH_KEYS[options.authType]
  if (!key) return Promise.reject({ message: "getUser - The authentication method '" + options.authType + "' is unknown. Values are: " + Object.keys(SQL_USER_MANAGEMENT_AUTH_KEYS).join(', '), context: options })

  // SQL Querying
  return db.getConnection()
    .then(function (conn) {
      const parameters = {
        key: key,
        id: options.key
      }
      return conn.query(SQL_USER_MANAGEMENT_GET, parameters)
        .then(function (results) {
          return results[0]
        })
        .finally(function () {
          conn.release()
        })
    })
}
module.exports.getUser = getUser


/**
 * Authenticators tables
 * @type {object}
 */
const SQL_USER_MANAGEMENT_SET_AUTH_TABLES = {
  'google': 'user_google',
  'twitter': 'user_twitter',
  'facebook': 'user_facebook'
}


/**
 *
 * @param {UserManagementSetOptions} options
 * @return {promise} the promise callback with the result of the query as parameter.
 */
module.exports.addUser = function (options) {

  // Input handling
  if (!options.authType) return Promise.reject({ message: "addUser - An authentication method must be given", context: options })
  options.table = SQL_USER_MANAGEMENT_SET_AUTH_TABLES[options.authType]
  if (!options.table) return Promise.reject({ message: "addUser - The authentication method is unknown. Values are: " + Object.keys(SQL_USER_MANAGEMENT_SET_AUTH_TABLES).join(', '), context: options })

  const context = {
    authTable: options.table,
    authKey: SQL_USER_MANAGEMENT_AUTH_KEYS[options.authType], // googleId, facebookId, etc
    authKeyValue: options.properties[SQL_USER_MANAGEMENT_AUTH_KEYS[options.authType]],
    authLookupCol: SQL_USER_MANAGEMENT_USER_KEYS[options.authType]
  }

  var authToWrite = Object.assign({}, options.properties)
  delete authToWrite.provider

  /** When adding a new user we must
   *  - Check if the authenticator ID is known
   *    - If it is, update the auth token and..
   *    - It if isn't, create it and...
   *  - Check if user is connected
   *    - If he is, update the user with the auth ID
   *    - If he isn't, create the user with the auth ID
   *  - Return the getUser result
   */
  const SQL_USER_MANAGEMENT_GET_AUTH_TOKEN = "SELECT * FROM {{authTable}} WHERE {{authKey}} = {authKeyValue}"

  const SQL_USER_MANAGEMENT_UPDATE_AUTH_TOKEN = "UDPATE {{authTable}} SET {values} WHERE {{authKey}} = {authKeyValue}"
  const SQL_USER_MANAGEMENT_NEW_AUTH_TOKEN = "INSERT INTO {{authTable}} SET {values}"

  const SQL_USER_MANAGEMENT_UPDATE_USER = "UPDATE user SET {{authLookupCol}} = (SELECT id FROM {{authTable}} WHERE {{authKey}} = {authKeyValue})"
  const SQL_USER_MANAGEMENT_NEW_USER = "INSERT INTO user SET {{authLookupCol}} = (SELECT id FROM {{authTable}} WHERE {{authKey}} = {authKeyValue})"

  return db.getConnection()
    .then(function (conn) {
      // First get the auth token
      return conn.query(SQL_USER_MANAGEMENT_GET_AUTH_TOKEN, context)
      .then(function (result) {
        // Then, if it exists, update it, else create it
        const queryToUse = result.length < 1 ? SQL_USER_MANAGEMENT_NEW_AUTH_TOKEN : SQL_USER_MANAGEMENT_UPDATE_AUTH_TOKEN
        return conn.query(queryToUse, Object.assign({ values: authToWrite }, context))
        .then(function (result) {
          // Then, if user is connected, update it with the token, else create a user
          const queryToUse = options.currentUser ? SQL_USER_MANAGEMENT_UPDATE_USER : SQL_USER_MANAGEMENT_NEW_USER
          // console.log({ logFrom: 'addUser', mode: options.currentUser ? 'update' : 'add', context: options, result: result })
          return conn.query(queryToUse, Object.assign({}, context))
          .then(function (result) {
            // Return the user
            return getUser({
              authType: 'sql',
              key: result.insertId || options.currentUser
            })
          })
        })
      }
    )
    .finally(function () { conn.release() })
  })
}