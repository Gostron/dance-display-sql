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

function reworkObject (object, labels) {
  // For each property of the object
  for (let key in object) {
    // And each label
    _.each(labels, function (label) {
      // If the property begins with the label, reunite it in a sub-object
      if (key.indexOf(label) === 0) {
        var newKey = key.length > label.length ? key.substring(label.length + 1) : 'name'
        if (!object[label]) object[label] = {}
        object[label][newKey] = object[key]
        delete object[key]
      }
    })
    // Recursively for arrays
    if (Array.isArray(object[key])) {
      for (let i = 0; i < object[key].length; i++)
      object[key][i] = reworkObject(object[key][i], labels)
    }
    // Recursively for sub-objects
    else if (Object.prototype.toString.call(object[key]) === '[object Object]') {
      object[key] = reworkObject(object[key], labels)
    }
  }
  return object
}

function generalSqlFilter (sql, id, competitionId, filterId, filterCompetitionId) {
  var filters = []
  if (id && filterId) filters.push(filterId + ' = {id}')
  if (competitionId && filterCompetitionId) filters.push(filterCompetitionId + ' = {competitionId}')
  if (filters.length > 0)
    return {
      sql: {
        sql: sql.sql + ' WHERE ' + filters.join(' AND '),
        nestTables: sql.nestTables
      },
      options: {
        id: id,
        competitionId: competitionId
      }
    }
  else return { sql: sql }
}

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
    ],
    simplify: function (results) {
      return _.map(results, function (result) {
        return {
          name: result.name,
          subtemplates: _.map(result.ref_subtemplate, function (template) {
            return {
              name: template.name,
              dances: _.map(template.ref_subtemplate_dance, function (dance) { return dance.ref_dance.name })
            }
          })
        }
      })
    }
  },
  // DANCE QUERY
  ref_dance: {
    sql: 'SELECT * FROM ref_dance',
    nestTables: false,
  },
  // AGE QUERY
  ref_age: {
    sql: 'SELECT * FROM ref_age',
    nestTables: false,
  },
  // CLEARANCE QUERY
  ref_clearance: {
    sql: 'SELECT * FROM ref_clearance',
    nestTables: false,
  },
  // NOTATION MODE QUERY
  ref_notation_mode: {
    sql: 'SELECT * FROM ref_notation_mode',
    nestTables: false,
  },
  // STAGE QUERY
  ref_stage: {
    sql: 'SELECT * FROM ref_stage',
    nestTables: false,
  },
  // JUDGE QUERY
  judge: {
    sql: 'SELECT * FROM judge',
    nestTables: false,
  },
  // CONTESTANT QUERY
  contestant: {
    sql: 'SELECT * FROM contestant',
    nestTables: false,
  },
  // COUPLE QUERY
  couple: {
    sql: 'SELECT * FROM couple',
    nestTables: false,
  },
  // CATEGORY QUERY
  category: {
    sql: 'SELECT * FROM category\
      LEFT JOIN view_competition             ON view_competition.id               = category.id_competition\
      LEFT JOIN stage                        ON stage.id_category                 = category.id\
      LEFT JOIN view_stage_dancer stage_d    ON stage_d.id_stage                  = stage.id\
      LEFT JOIN category_dance               ON category_dance.id_category        = category.id\
      LEFT JOIN view_category_judge          ON view_category_judge.id_category   = category.id\
      LEFT JOIN view_category_subscription   ON view_category_subscription.id_category = category.id',
    sqlFilter: function (sql, id, competitionId) {
      return generalSqlFilter(sql, id, competitionId, 'category.id', 'category.id_competition')
    },
    nestTables: true,
    nestingOptions: [
      { tableName: 'category',                    pkey: 'id', fkeys: [{ table: 'view_competition', col: 'id_competition' }]},
      { tableName: 'stage',                       pkey: 'id', fkeys: [{ table: 'category', col: 'id_category' }]},
      { tableName: 'stage_d',                     pkey: 'id', fkeys: [{ table: 'stage', col: 'id_stage' }]},
      { tableName: 'view_competition',            pkey: 'id'},
      { tableName: 'category_dance',              pkey: 'id', fkeys: [{ table: 'category', col: 'id_category' }]},
      { tableName: 'view_category_judge',         pkey: 'id', fkeys: [{ table: 'category', col: 'id_category' }]},
      { tableName: 'view_category_subscription',  pkey: 'id', fkeys: [{ table: 'category', col: 'id_category' }]}
    ],
    simplify: function (results) {
      return _.map(results, function (category) {
        category.stages = _.map(_.sortBy(category.stage, 'index'), function (stage) {
          stage.dancers = _.map(stage.stage_d, function (couple) {
            delete couple.id_stage
            delete couple.id_competition
            return couple
          })
          delete stage.stage_d
          delete stage.id_category
          return stage
        })
        category.subscriptions = _.map(category.view_category_subscription, function (couple) {
          delete couple.id_category
          delete couple.id_competition
          return couple
        })
        category.judges = _.map(category.view_category_judge, function (judge) {
          delete judge.id_category
          return judge
        })
        category.dances = _.map(_.sortBy(category.category_dance, 'index'), 'dance')
        delete category.stage
        delete category.view_category_subscription
        delete category.view_category_judge
        delete category.category_dance
        delete category.id_competition
        category.competition = category.view_competition
        delete category.view_competition
        return category
      })
    },
    reworkLabels: ['male', 'female', 'current_dance', 'current_event', 'current_stage', 'current_category']
  },
  // COMPETITION QUERY
  competition: {
    sql: 'SELECT * FROM view_competition',
    nestTables: false,
    sqlFilter: function (sql, id) {
      return generalSqlFilter(sql, id, null, 'id')
    },
    reworkLabels: ['current_dance', 'current_event', 'current_stage', 'current_category']
  },
  // EVENT QUERY
  event: {
    sql: 'SELECT * FROM view_event\
      LEFT JOIN view_stage_dancer stage_d    ON view_event.id_stage    = stage_d.id_stage\
      LEFT JOIN category_dance               ON view_event.id_category = category_dance.id\
      LEFT JOIN view_category_judge          ON view_event.id_category = view_category_judge.id_category\
      LEFT JOIN view_category_subscription   ON view_event.id_category = view_category_subscription.id_category',
    sqlFilter: function (sql, id, competitionId) {
      return generalSqlFilter(sql, id, competitionId, 'view_event.id', 'view_event.id_competition')
    },
    nestTables: true,
    nestingOptions: [
      { tableName: 'view_event',                  pkey: 'id', fkeys: [{ table: 'stage_d', col: 'id_stage' }, { table: 'view_category_subscription', col: 'id_category' }, { table: 'view_category_judge', col: 'id_category' }, { table: 'category_dance', col: 'id_category' }]},
      { tableName: 'stage_d',                     pkey: 'id'},
      { tableName: 'category_dance',              pkey: 'id'},
      { tableName: 'view_category_judge',         pkey: 'id'},
      { tableName: 'view_category_subscription',  pkey: 'id'}
    ],
    simplify: function (results) {
      // TODO
      return results
    }
  },
  // STAGE QUERY
  stage: {
    sql: 'SELECT * FROM view_stage\
      LEFT JOIN view_stage_dancer stage_d    ON view_stage.id          = stage_d.id_stage\
      LEFT JOIN category_dance               ON view_stage.id_category = category_dance.id_category\
      LEFT JOIN view_category_judge          ON view_stage.id_category = view_category_judge.id_category\
      LEFT JOIN view_category_subscription   ON view_stage.id_category = view_category_subscription.id_category',
    sqlFilter: function (sql, id, competitionId) {
      return generalSqlFilter(sql, id, competitionId, 'view_stage.id', 'view_stage.id_competition')
    },
    nestTables: true,
    nestingOptions: [
      { tableName: 'view_stage',                  pkey: 'id'},
      { tableName: 'stage_d',                     pkey: 'id', fkeys: [{ table: 'view_stage', col: 'id_stage' }]},
      { tableName: 'category_dance',              pkey: 'id', fkeys: [{ table: 'view_stage', col: 'id_category' }]},
      { tableName: 'view_category_judge',         pkey: 'id', fkeys: [{ table: 'view_stage', col: 'id_category' }]},
      { tableName: 'view_category_subscription',  pkey: 'id', fkeys: [{ table: 'view_stage', col: 'id_category' }]}
    ],
    simplify: function (results) {
      return _.map(results, function (stage) {
        stage.dancers = _.map(stage.stage_d, function (couple) {
          delete couple.id_category
          delete couple.id_competition
          return couple
        })
        stage.category_subscriptions = _.map(stage.view_category_subscription, function (couple) {
          delete couple.id_category
          delete couple.id_competition
          return couple
        })
        stage.judges = _.map(stage.view_category_judge, function (judge) {
          delete judge.id_category
          return judge
        })
        stage.dances = _.map(_.sortBy(stage.category_dance, 'index'), 'dance')
        delete stage.stage_d
        delete stage.view_category_subscription
        delete stage.view_category_judge
        delete stage.category_dance
        delete stage.id_competition
        return stage
      })
    },
    reworkLabels: ['category', 'male', 'female']
  }
}


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
module.exports.testView = function (options, query) {

  var options = SQL_VIEW_LIST[options.object]
  if (!options) return Promise.reject('Impossible de trouver l\'objet \'' + options.object + '\' dans la liste.')
  var sql = options
  var parameters = null
  if (options.sqlFilter) {
    var filter = options.sqlFilter(sql, query.id, query.competitionId)
    sql = filter.sql
    parameters = filter.options
  }
  // SQL Querying
  return db.getConnection()
    .then(function (conn) {
      return conn.query(sql, parameters)
        .then(function (results) {
          var output = results
          /// Results obtained here
          // Filter for nestification
          if (options.nestTables && options.nestingOptions)
            output = nester.convertToNested(results, options.nestingOptions)
          // Additional simplification (deleting props, etc)
          if (options.simplify)
            output = options.simplify(output)
          // Property reunification in object
          if (options.reworkLabels)
            output = _.map(output, function (result) { return reworkObject(result, options.reworkLabels) })

          return output
        })
        .finally(function () {
          conn.release()
        })
    })
}