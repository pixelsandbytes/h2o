/* jshint strict: false */
var h2o = require('./../../lib/server.js'),
    responseSender = require('./response-sender.js'),
    /**
     * All contents of lib/impl/ are utilities that are useful but not mandatory.
     * They are provided for your convenience should you wish to use them instead of
     * implementing your own.
     * All utilities are available as h2o.utils.<filename>
     */
    logger = h2o.utils['logger-console'],
    errorHandler = h2o.utils['error-with-xhr'](responseSender, logger),
    express = require('express');

/**
 * Defines the express application that your server will run
 * a.k.a. the routes, logic, etc. of your web application
 * @param an express application, which this function will manipulate and augment
 */
function defineApp(app) {

    app.use('/foo', function appFoo(req, res) {
        if (req.xhr) {
            var body = {
                foo: 'bar'
            };
            responseSender.sendJSON(res, body);
        } else {
            responseSender.sendPage(res, 'Foo', '<h1>Bar!</h1>', 200);
        }
    });

    app.use('/fail', function appFail(req, res) {
        /* jshint unused: false */
        throw new Error("Don't worry, the error handler will take care of this");
    });

    app.use('/fail-async', function appFailAsync(req, res) {
        /* jshint unused: false */
        setTimeout(function() {
            throw new Error("I may be async, but the error handler will still catch me!");
        }, 100);
    });


    app.use('/', express.static(__dirname));

}

h2o()
    /**
     * Sets the function that defines the express application of your server
     * @param a function that accepts an express application as its only parameter
     */
    .setAppDefiner(defineApp)
    
    /**
     * Sets the logger used by h2o. See lib/impl/logger-console.js for a
     * logger that simply logs to the console. You can implement
     * your own, and use any third-party library, if you wish.
     * @param a logger object that must implement the following functions:
     *     info(messageString)
     *     warn(messageString)
     *     error(messageString)
     *     fatal(messageString)
     */
    .setLogger(logger)
    
    /**
     * Sets the function that will be invoked when an error,
     * synchronous or asynchronous, occurs in your web application.
     * You can control how your web application responds to the client
     * in the event of any errors.
     * @param a function that accepts the following parameters:
     *     err: an error object
     *     req: the HTTP request being served
     *     res: the HTTP response being constructed
     */
    .setErrorHandler(errorHandler)
    
    /**
     * Sets the port that you web application will be listening on.
     * If port is not set explicitly, defaults to 80
     * @param a port number
     */
    .setPort(8765)
    
    /**
     * Starts your web application
     */
    .run();