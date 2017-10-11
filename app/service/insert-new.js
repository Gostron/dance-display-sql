/*
 * danceDisplaySql - https://github.com/dance-display-sql/dance-display-sql.git
 *
 * Copyright (c) 2017 dance-display-sql
 */

/**
 * @module dds/service/insert-new
 *
 * @requires lodash
 * @requires joi
 * @requires module:dds/args
 * @requires module:dds/db
 * @requires module:dds/logger
 */

'use strict'

const _      = require('lodash')
const Joi    = require('joi')
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
  'dance': 'dance',
  'template': 'template',
  'subtemplate': 'subtemplate',
  'stage': 'stage',
  'age': 'age'
}

const minStringLength = 2
const maxStringLength = 30
const JoiID = Joi.number().integer().min(1)
const JoiDate = Joi.date().min(new Date('1910/01/01'))
const JoiNI = Joi.number().integer().min(0)
const JoiStr = Joi.string().min(minStringLength).max(maxStringLength)

const SQL_INSERT_NEW_VALIDATION_PER_OBJECT = {
  'competition': Joi.object().keys({
    date_begin: JoiDate.required(),
    date_end: JoiDate.required(),
    name: JoiStr.required(),
    subname: Joi.string()
  }).required(),
  'contestant': Joi.object().keys({
    firstname: JoiStr.required(),
    lastname: JoiStr.required(),
    birthdate: JoiDate.max(new Date())
  }).required(),
  'couple': Joi.object().keys({
    id_male: JoiID.required(),
    id_female: JoiID.required()
  }).required(),
  'judge': Joi.object().keys({
    country: JoiStr.required(),
    firstname: JoiStr.required(),
    lastname: JoiStr.required()
  }).required(),
  'mark': Joi.object().keys({
    is_note: Joi.boolean().required(),
    value: JoiNI.required(),
    id_category_stage_couple: JoiID.required(),
    id_judge: JoiID.required()
  }).required(),
  'event': Joi.object().keys({
    is_break: Joi.boolean(),
    has_presentation: Joi.boolean(),
    id_presentation_dance: JoiID,
    message: Joi.string(),
    schedule: JoiDate,
    duration: JoiNI,
    position: JoiNI,
    id_competition: JoiID.required(),
    id_category_stage: JoiID
  }).required(),
  'category': Joi.object().keys({
    name: Joi.string().required(),
    label: Joi.string(),
    id_competition: JoiID.required(),
    id_template: JoiID.required(),
    id_subtemplate: JoiID.required(),
    id_age: JoiID.required()
  }).required(),
  'dance': JoiStr.required(),
  'age': JoiStr.required(),
  'template': JoiStr.required(),
  'subtemplate': Joi.object().keys({
    name: JoiStr.required(),
    id_template: JoiID.required()
  }).required(),
  'stage': Joi.object().keys({
    name: JoiStr.required(),
    has_notes: Joi.boolean().required()
  }).required()
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

  // Passage à la validation de chaque objet
  var validationSchema = SQL_INSERT_NEW_VALIDATION_PER_OBJECT[options.object]
  var errors = []
  _.each(options.values, function (value) {
    var error = Joi.validate(value, validationSchema).error
    if (error) errors.push({
      message: error.details[0].message.replace(/"/ig, "'"),
      element: value
    })
  })

  // Pour tous les objets sans erreur
  var values = _.filter(options.values, function (v) { return !Joi.validate(v, validationSchema).error })
  if (values.length < 1) {
    return Promise.reject({
      message: "No object passed validation.",
      errors: errors
    })
  }

  fields = Object.keys(values[0])
  values = _.map(values, function (v) { return _.map(fields, function (f) { return v[f] }) })

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
          if (errors) results.errors = errors
          return results
        })
        .finally(function () {
          conn.release()
        })
    })
}