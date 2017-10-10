/*
 * danceDisplaySql - https://github.com/dance-display-sql/dance-display-sql.git
 *
 * Copyright (c) 2017 dance-display-sql
 */

/**
 * Utility function for settings and / or configuration.
 *
 * @module dds/config-util
 *
 * @requires lodash
 */

'use strict';

const _ = require('lodash');

/**
 * Returns the value of the named element in the settings object.
 *
 * @param {object} settings the settings object
 * @param {string} name the name of the settings element
 * @param {*} defValue the default value if the element does not exist.
 * @return {*} The value
 */
module.exports.getSetting = function (settings, name, defValue) {
  return _.get(settings, name, defValue);
};
