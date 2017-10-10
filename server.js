/*
 * danceDisplaySql - https://github.com/dance-display-sql/dance-display-sql.git
 *
 * Copyright (c) 2017 dance-display-sql
 */

/**
 * Configures and startup the application server
 *
 * @module dds
 *
 * @requires app-module-path
 * @requires fs
 * @requires path
 * @requires dds/info
 * @requires dds/args
 * @requires dds/configure
 * @requires dds/shutdown
 */

'use strict';

//
// add the current directory to the require paths.
//   -> all internal modules have the save require path "app/services/..." or "app/info"
//
require('app-module-path').addPath(__dirname);

const fs        = require('fs');
const path      = require('path');

const info      = require('app/info');
const args      = require('app/args');
const configure = require('app/configure');
const shutdown  = require('app/shutdown');


if (args.isHelp()) {
  const content = fs.readFileSync(path.join(__dirname, 'man.txt'));
  _printHeaderAndHero();
  console.info(content.toString());
  process.exit(0);
}

/**
 * @type {ConfigureOptions}
 */
const configureOptions = {
  configFilename: args.getConfigFilename(),
  name:       info.getAppName(),
  path:       args.getLogPath(),
  shutdown: function (name) {
    shutdown.shutdown(name);
    console.info('Server has been shutdown by "%s"', name);
  }
};

//
// Try to prepare the startup and returns the settings object.
//
configure(configureOptions)
  .then(function (settings) {
      var logger = null;
      try {
        // initialize Logger
        logger = require('app/logger').start(settings);
        // print the header
        _printHeaderAndHero(logger);
        logger.info('Logger started...');
        // initialize DB
        require('app/db').start(settings);
        logger.info('The connection pool started successfully...');

        // TODO Add things for starting or initialize with settings

        // start the application
        require('app/application')
          .start(settings)
          .then(function () {
            // now the express application is listen
            logger.info('Application is running ...');
          }, function (reason) {
            logger.warn(reason);
            process.exit(1);
          });
      } catch (e) {
        if (logger) {
          logger.warn('[dds] ', e);
        } else {
          logger.warn('[dds] ', e);
        }
      }
    },
    function (reason) {
      console.warn('[%s] %s', reason.code || 'UNKNOWN', reason.message || 'Unknown message');
      console.warn('[%s] object -> %s', reason.code || 'UNKNOWN', JSON.stringify(reason));
    }
  );

/**
 * Prints the header and the hero ascii art to the console and logger.
 *
 * @param {logger} [logger]
 * @private
 */
function _printHeaderAndHero(logger) {
  const heroFile = path.join(__dirname, 'hero.txt');
  if (fs.existsSync(heroFile)) {
    const hero = fs.readFileSync(heroFile, 'utf8').toString();
    const lines = hero.split('\n');
    lines.forEach(function (line) {
      if (logger) {
        logger.info(line);
        if (logger.isConsole) {
          return;
        }
      }
      console.info(line);
    });
  }
  info.headerPrint(logger);
}
