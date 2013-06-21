/* jshint strict: false */
var h2o = require('./../../lib/server.js'),
    responder = require('./response-sender.js'),
    logger = h2o.utils['logger-console'],
    errorHandler = h2o.utils['error-with-xhr'](responder, logger),
    express = require('express');

function defineApp(app) {

    app.use('/foo', function appFoo(req, res) {
        if (req.xhr) {
            var body = {
                foo: 'bar'
            };
            responder.sendJSON(res, body);
        } else {
            responder.sendPage(res, 'Foo', '<h1>Bar!</h1><p>Mmm... candy bars.</p>', 200);
        }
    });

    app.use('/fail', function appFail(req, res) {
        /* jshint unused: false */
        throw new Error('Game over');
    });

    app.use('/fail-async', function appFailAsync(req, res) {
        /* jshint unused: false */
        setTimeout(function() {
            throw new Error("But I still haven't found what I'm looking for");
        }, 500);
    });


    app.use('/', express.static(__dirname));

}

h2o()
    .setAppDefiner(defineApp)
    .setLogger(logger)
    .setErrorHandler(errorHandler)
    .run();