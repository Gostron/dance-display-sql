/*
 * danceDisplaySql - https://github.com/dance-display-sql/dance-display-sql.git
 *
 * Copyright (c) 2017 dance-display-sql
 *
 * Purpose:
 * Configuring the application.
 *
 * Note:
 * Don't use the logger here, because it is not initialized at this time.
 */

/**
 * Configures the application.
 *
 * @module dds/configure
 *
 * @requires fs
 * @requires path
 * @requires lodash
 * @requires q
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const _    = require('lodash');
const Q    = require('q');

const UNKNOWN_PID = 0;

/**
 * @name ConfigureOptions
 * @property {string}   [configFilename] the filename of the configuration file
 * @property {string}   [name] the name of the application
 * @property {string}   [path] the path to the pid file
 * @property {function} [shutdown] the function is called by the signal shutdown
 */


/**
 * Configure the application
 *
 * * First step is to stop a former application (its pid is written in the PID file)
 * * Second step is to write the new pid into the PID file
 * * Third step is to register the exit callback function
 * * Last step is to read the configuration file and create the configuration instance
 *
 * @param {ConfigureOptions} options the options
 * @return the promise callback with the JSON settings instance as parameter.
 */
module.exports = function configure (options) {
  const appName      = options.name || 'dds-server';
  const logPath      = options.path || process.cwd();

  // get the pathname of the configuration or the current working directory.
  const confPathname = options.configFilename || (path.join(process.cwd(), appName + '.json'));
  const pidPathname  = path.join(logPath, appName + '.pid');

  // wait between shutdown check!
  // TODO The stop wait is constant or argument
  const stopWaiting  = 500;

  // use the shutdown callback or use the dummy function.
  const shutdown     = options.shutdown || function () { };

  return _readPid(pidPathname)
    .then(function (pid) {
      return _killProcess(pid, stopWaiting);
    })
    .then(function () {
      // write the current pid of the application
      return _writePid(pidPathname);
    })
    .then(function () {
      // register the shutdown function
      process.on('SIGINT', function () {
        _shutdown('Ctrl+C', shutdown);
      });
      process.on('SIGTERM', function () {
        _shutdown('Kill..', shutdown);
      });
      process.on('SIGHUP', function () {
        _shutdown('HangUp', shutdown);
      });
      return true;
    })
    .then(function () {
      // read the configuration
      return _readConfig(confPathname)
        .then(function (settings) {
          _.set(settings, 'logger.path', logPath);
          return settings;
        })
    });
};

function _readPid(pathname) {
  const done = Q.defer();
  fs.readFile(pathname, 'utf8', function (err, content) {
    if (err) {
      done.resolve(UNKNOWN_PID);
      return;
    }
    try {
      done.resolve(parseInt(content, 10));
    } catch (e) {
      done.resolve(UNKNOWN_PID);
    }
  });
  return done.promise;
}

function _readConfig(pathname) {
  const done = Q.defer();
  fs.readFile(pathname, 'utf8', function (err, content) {
    if (err) {
      return done.reject({
        code: 'CONFIG_NOT_FOUND',
        message: 'Could not find the configuration file "' + pathname + '"!',
        error: err.message || 'no additional information'
      });
    }
    try {
      const settings = JSON.parse(content);
      done.resolve(settings);
    } catch (e) {
      done.reject({
        code: 'CONFIG_PARSE',
        message: 'Invalid JSON format of the file "' + pathname + '"!',
        error: !e ? 'null' : e.message || 'no additional information'
      });
    }
  });
  return done.promise;
}

function _checkProcess(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch (e) {
    return false;
  }
}

function _killProcess(pid, stopWaiting) {
  var done = Q.defer();

  process.nextTick(function () {

    if (pid <= UNKNOWN_PID || !_checkProcess(pid)) {
      // pid is unknown !!
      return done.resolve();
    }
    console.info('sending the signal "SIGTERM" to the other process "%s" !!', pid);
    if (!_sendKill(pid, 'SIGTERM')) {
      // error?
      return done.reject(util.format('Could not terminate the process [%s]', pid));
    }
    // wait duration and check whether other process is running
    setTimeout(function () {
      console.info('trying to send the signal "SIGKILL" to the other process "%s" !!', pid);
      if (_checkProcess(pid)) {
        // send the signal "SIGKILL" to the other process!!!
        if (!_sendKill(pid, 'SIGKILL')) {
          return done.reject(util.format('Could not kill the process [%s]', pid));
        }
        done.resolve();
      }
      done.resolve();
    }, stopWaiting);
  });

  return done.promise;
}

function _sendKill(pid, signal) {
  try {
    process.kill(pid, signal);
    return true;
  }
  catch (e) {
    return false;
  }
}

//
// Writes the new pid into the PID file.
//
function _writePid(pidFilename) {
  var done = Q.defer();
  fs.writeFile(pidFilename, process.pid, 'utf8', function (err) {
    if (err) {
      return done.reject(err);
    }
    done.resolve();
  });
  return done.promise;
}

function _shutdown(name, cb) {
  try {
    cb(name);
  }
  catch (e) {
    console.warn('An error has occurred: %s', e.message);
  }
  finally {
    process.exit();
  }
}
