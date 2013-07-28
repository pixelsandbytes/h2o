/* jshint strict: false */
var http = require('http'),
    should = require('should'),
    h2o = require('../lib/server.js');

var logger = {
    /* jshint unused: false */
    info: function(msg) {},
    warn: function(msg) {},
    error: function(msg) {},
    fatal: function(msg) {}
};

var responseSender = {
    sendErrorJSON: function sendErrorJSON(res, err, status) {
        /* jshint unused: false */
        throw new Error('Not implemented');
    },

    sendErrorPage: function sendErrorPage(res, err, status) {
        var resString = err.message || err;
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('Content-Length', resString.length);
        res.send(status, resString);
        res.end();
    }
};
var errorHandler = h2o.utils['error-with-xhr'](responseSender, logger);

function createServer(defineApp) {
    var server = h2o()
        .setAppDefiner(defineApp)
        .setLogger(logger)
        .setErrorHandler(errorHandler)
        .setPort(8765)
        .setClusterUse(false)
        .run();
    return server;
}

function runTest(path, expected, done) {
    http.get({
        hostname: 'localhost',
        port: 8765,
        path: path
    }, function(res) {
        var resString = '';
        res.statusCode.should.equal(expected.status);
        res.headers['content-type'].should.eql(expected.contentType);
        res.headers['content-length'].should.eql(expected.response.length + '');
        res.on('data', function(chunk) {
            resString += chunk;
        });
        res.on('end', function() {
            resString.should.equal(expected.response);
            done();
        });
    }).on('error', function(e) {
        should.fail(e);
    });
}

function sendResponse(res, status, resString) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Content-Length', resString.length);
    res.send(status, resString);
    res.end();
}

/* global describe, before, it, after */
describe('Integration - basic server', function() {
    'use strict';

    var server;

    before(function() {
        function defineApp(app) {

            app.use('/foo', function appFoo(req, res) {
                sendResponse(res, 200, 'bar');
            });

            app.use('/error', function appError(req, res) {
                sendResponse(res, 400, 'bad request');
            });

            app.use('/fail', function appFail(req, res) {
                throw new Error('failed');
            });

        }

        server = createServer(defineApp);
    });

    describe('/foo', function() {
        it('should return a 200 response', function(done) {
            runTest('/foo', {
                status: 200,
                contentType: 'text/html; charset=utf-8',
                response: 'bar'
            }, done);
        });
    });

    describe('/error', function() {
        it('should return a 400 response', function(done) {
            runTest('/error', {
                status: 400,
                contentType: 'text/html; charset=utf-8',
                response: 'bad request'
            }, done);
        });
    });

    describe('/fail', function() {
        it('should return a 500 response', function(done) {
            runTest('/fail', {
                status: 500,
                contentType: 'text/html; charset=utf-8',
                response: 'failed'
            }, done);
        });
    });

    after(function() {
        server.close();
    });
});

describe('Integration - server with streaming and delays', function() {
    'use strict';

    var server;

    before(function() {
        function defineApp(app) {

            app.use('/chunky', function appFoo(req, res) {
                var resString1 = 'foo',
                    resString2 = 'bar',
                    resString3 = 'baz';
                res.setHeader('Content-Type', 'text/html; charset=utf-8');
                res.setHeader('Content-Length', resString1.length + resString2.length + resString3.length);
                setTimeout(function() {
                    res.write(resString1);
                    setTimeout(function() {
                        res.write(resString2);
                        setTimeout(function() {
                            res.write(resString3);
                            res.end();
                        }, 10);
                    }, 10);
                }, 10);
            });

            app.use('/delayed-fail', function appError(req, res) {
                setTimeout(function() {
                    throw new Error('failed');
                }, 100);
            });

        }

        server = createServer(defineApp);
    });

    describe('/chunky', function() {
        it('should return a 200 response', function(done) {
            runTest('/chunky', {
                status: 200,
                contentType: 'text/html; charset=utf-8',
                response: 'foobarbaz'
            }, done);
        });
    });

    describe('/delayed-fail', function() {
        it('should return a 500 response', function(done) {
            runTest('/delayed-fail', {
                status: 500,
                contentType: 'text/html; charset=utf-8',
                response: 'failed'
            }, done);
        });
    });

    after(function() {
        server.close();
    });

});