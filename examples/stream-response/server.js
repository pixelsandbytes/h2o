/* jshint strict: false */
var h2o = require('./../../lib/server.js'),
    responseSender = require('./response-sender.js'),
    logger = h2o.utils['logger-console'],
    errorHandler = h2o.utils['error-with-xhr'](responseSender, logger),
    express = require('express');

function defineApp(app) {

    app.use('/rapunzel', function appRapunzel(req, res) {
        if (req.xhr) {
            responseSender.sendFileAsJSON(res, 'rapunzel.txt');
        } else {
            responseSender.sendFileAsHTML(res, 'rapunzel.txt');
        }
    });

    app.use('/fail-async', function appFail(req, res) {
        /* jshint unused: false */
        setTimeout(function() {
            throw new Error('The HTML error page is being streamed out too!');
        }, 100);
    });


    app.use('/', express.static(__dirname));

}

/**
 * See examples/basic/server.js for explanations on the basics of h2o
 */
h2o()
    .setAppDefiner(defineApp)
    .setLogger(logger)
    .setErrorHandler(errorHandler)
    .setPort(8765)
    .run();