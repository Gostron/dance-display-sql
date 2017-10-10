/*
 * danceDisplaySql - https://github.com/dance-display-sql/dance-display-sql.git
 *
 * Copyright (c) 2017 dance-display-sql
 *
 * Purpose:
 */

/**
 * Read the cli arguments
 *
 * ```
 * -v | --verbose     show the debug and trace messages
 * --help             show the man page of the application and exit.
 * --config=pathname  the pathname to the configuration file.
 * --log=pathname     the pathname to the log files and the place of the pid file
 * ```
 *
 * @module dds/args
 *
 * @requires minimist
 */

'use strict';

const minimist = require('minimist');

const mParams = minimist(process.argv.slice(2));
const mVerbose = mParams.verbose || mParams.v || false;
const mHelp = mParams.help || false;


/**
 * Manages the verbose messages
 *
 * @return {boolean}
 */
module.exports.isVerbose = function () {
  return mVerbose;
};

/**
 * Application should show the help message when argument `--help` is present
 *
 * @return {boolean}
 */
module.exports.isHelp = function () {
  return mHelp;
};

/**
 * Returns the filename of the configuration file.
 *
 * @return {string|null} the filename of the configuration file
 */
module.exports.getConfigFilename = function () {
  return mParams.config || null;
};

/**
 * Returns the path of the log files and the location of the pid file
 *
 * @return {String|null} the path or null
 */
module.exports.getLogPath = function () {
  return mParams.log || null;
};
