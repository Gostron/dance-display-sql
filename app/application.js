/*
 * danceDisplaySql - https://github.com/dance-display-sql/dance-display-sql.git
 *
 * Copyright (c) 2017 dance-display-sql
 */

/**
 * The express application
 *
 * @module dds/application
 *
 * @requires body-parser
 * @requires express
 * @requires q
 * @requires module:dds/info
 * @requires module:dds/config-util
 * @requires module:dds/logger
 * @requires module:dds/middleware
 * @requires module:dds/router/mysql
 */

'use strict';

const bodyParser      = require('body-parser');
const express         = require('express');
const Q               = require('q');

const info            = require('app/info');
const configUtil      = require('app/config-util');
const logger          = require('app/logger').getLogger('dds');

const middleware      = require('app/middleware');

const routerMySQL     = require('app/router/mysql');

const app = express();

const DEFAULT_HOST    = 'localhost';

/**
 * Starts the application.
 *
 * @param {object} settings
 * @return {promise} the promise callback is returned after the application starts slistening.
 */
module.exports.start = function (settings) {

  // adds the config instance under "config".
  app.set('settings', settings);
  // sets the application title
  app.set('title', info.getAppTitle());

  // Middlewares...

  app.use(middleware.measureTime());

  app.use(bodyParser.json());

  // Routers...

  app.use('/mysql', routerMySQL);

  // TODO Add here your routers


  // Endpoints...

  /**
   * @api {get} /about About
   * @apiName GetAbout
   * @apiGroup System
   * @apiDescription Shows the information about the application
   * @apiVersion 0.0.1
   * @apiExample {curl} Example usage:
   *     curl -i http://localhost:3000/about
   *
   * @apiSuccess {String} name the application name
   * @apiSuccess {String} title the title of the application
   * @apiSuccess {String} version the version of the application
   * @apiSuccess {String} vendor the author / company of the application
   * @apiSuccess {String} description a short description
   *
   * @apiSuccessExample {json} Success response:
   *     HTTP/1.1 200 OK
   *     {
   *       "name": "dummy-rest",
   *       "title": "Dummy Rest Interface",
   *       "version": "0.0.1",
   *       "vendor": "Dummy <dummy@example.com>",
   *       "description": "This is a dummy service",
   *       "build": "20161004-133401"
   *     }
   */
  app.get('/about', function about(req, res) {
    res.send({
      name: info.getAppName(),
      title: info.getAppTitle(),
      version: info.getAppVersion(),
      vendor: info.getAppVendor(),
      description: info.getAppDescription(),
      build: info.getBuildTimestamp()
    });
  });

  // Starting...

  // get the port and host
  const port = configUtil.getSetting(settings, 'server.port', 0);
  const host = configUtil.getSetting(settings, 'server.host', DEFAULT_HOST);

  const done = Q.defer();

  if (port > 0) {
    // starts the listening of the express application...
    app.listen(port, host, function () {
      logger.info('Server is listening on http://', host, ':', port);
      done.resolve(true);
    });
  } else {
    // missing the port for the server...
    process.nextTick(function () {
      done.reject('Missing the property "server.port"!');
    });
  }

  return done.promise;
};
