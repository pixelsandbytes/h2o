/* jshint strict: false */
var h2o = require('./../lib/server.js'),
    logger = require('./../lib/impl/logger-console'),
    responder = require('./responder-basic.js'),
    errorHandler = require('./../lib/impl/error-with-xhr')(responder, logger),
    express = require('express');

function defineApp(app) {

    app.use('/json', function appEcho(req, res) {
        var body = {
            foo: 'bar',
            isXhr: req.xhr
        };
        responder.sendJSON(res, body);
    });

    app.use('/fail', function appFail(req, res) {
        /* jshint unused: false */
        throw new Error('Oops');
    });

    app.use('/fail-async', function appFailAsync(req, res) {
        /* jshint unused: false */
        setTimeout(function () {
            throw new Error('... Oops');
        }, 500);
    });

    app.use('/', express.static(__dirname));

}

h2o()
    .setAppDefiner(defineApp)
    .setLogger(logger)
    .setErrorHandler(errorHandler)
    .run();