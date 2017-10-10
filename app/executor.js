/*
 * danceDisplaySql - https://github.com/dance-display-sql/dance-display-sql.git
 *
 * Copyright (c) 2017 dance-display-sql
 */

/**
 * Capsules in a Endpoint the service calls and claims Exception
 *
 * **Example**
 * ```js
 * router.post('/user', function (req, res) {
 *   executor.execute(req, res, function (sender) {
 *
 *     const userModel = req.body;
 *     const promise   = service.save(userModel);
 *     const property  = 'result';
 *
 *     sender(promise, property);
 *   });
 * });
 * ```
 *
 * @module dds/executor
 *
 * @requires util
 * @requires lodash
 * @requires dds/http-util
 */

'use strict';

const util       = require('util');

const _          = require('lodash');

const httpStatus = require('app/http-status');

/**
 * Executes the service call, send the result to the client and catches the errors.
 *
 * @param {request}  req the express request
 * @param {response} res the express response
 * @param {function} cb the callback, that collect the answer
 */
module.exports.execute = function (req, res, cb) {
  const url = req.originalUrl;

  // Function given to services to be used as a call
  function __sender(promise, propertyName) {
    // If function is called without a promise, no result !
    if (!promise.then) {
      res.status(httpStatus.SERVER_ERROR)
        .send({
          status: 'error',
          message: 'Could not found a result'
        })
      return
    }
    // Is a promise is given, catch its rejection or return the result
    promise.then(
      function (result) {
        var data = { status: 'ok' }
        data[propertyName] = result
        res.send(data)
      },
      function (reason) {
        res.status(httpStatus.BAD_REQUEST).send({
          status: 'error',
          error: reason
        })
      }
    )
  }

  // Calling the callback (as is the role)
  try {
    cb(__sender)
  } catch (e) {
    e = e.message
    const message = util.format('[dds]: %s (%s)', e, url)
    res.status(httpStatus.BAD_REQUEST)
      .send({
        status: 'error',
        message: message
      })
  }
}
