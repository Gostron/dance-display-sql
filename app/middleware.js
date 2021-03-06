/*
 * Temperature Monitor Server - https://github.com/blueskyfish/temperature-monitor-server.git
 *
 * Copyright (c) 2016 BlueSkyFish
 */

/**
 * Middleware handler to read the http header field and measure the request time.
 *
 * @module dds/middleware
 *
 * @requires dds/logger
 */

'use strict';

const logger  = require('app/logger').getLogger('dds.middleware');

/**
 * measureTime - Returns the middleware, that measures the time of every request.
 *
 * @return {Function} middleware function.
 */
module.exports.measureTime = function () {
  return function measureTimeMiddleware(req, res, next) {
    const startTime = Date.now();
    const url = req.originalUrl;
    const method = req.method;
    next();
    logger.info('request [' + method + ']: "', url, '" in ', Date.now() - startTime, ' ms');
  }
};
