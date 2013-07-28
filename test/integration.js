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

/* global describe, before, it, after */
describe('Basic server', function() {
    'use strict';

    var server;

    before(function() {
        function defineApp(app) {

            app.use('/foo', function appFoo(req, res) {
                var resString = 'bar';
                res.setHeader('Content-Type', 'text/html; charset=utf-8');
                res.setHeader('Content-Length', resString.length);
                res.send(200, resString);
                res.end();
            });

            app.use('/error', function appError(req, res) {
                var resString = 'bad request';
                res.setHeader('Content-Type', 'text/html; charset=utf-8');
                res.setHeader('Content-Length', resString.length);
                res.send(400, resString);
                res.end();
            });

            app.use('/fail', function appFail(req, res) {
                throw new Error('failed');
            });

        }

        server = createServer(defineApp);
    });

    describe('/foo', function() {
        it('should return a 200 response', function(done) {
            var response = 'bar';

            http.get({
                hostname: 'localhost',
                port: 8765,
                path: '/foo'
            }, function(res) {
                res.statusCode.should.equal(200);
                res.headers['content-type'].should.eql('text/html; charset=utf-8');
                res.headers['content-length'].should.eql(response.length + '');
                res.on('data', function(chunk) {
                    chunk.toString().should.equal(response);
                    done();
                });
            }).on('error', function(e) {
                should.fail(e);
            });
        });
    });

    describe('/error', function() {
        it('should return a 400 response', function(done) {
            var response = 'bad request';

            http.get({
                hostname: 'localhost',
                port: 8765,
                path: '/error'
            }, function(res) {
                res.statusCode.should.equal(400);
                res.headers['content-type'].should.eql('text/html; charset=utf-8');
                res.headers['content-length'].should.eql(response.length + '');
                res.on('data', function(chunk) {
                    chunk.toString().should.equal(response);
                    done();
                });
            }).on('error', function(e) {
                should.fail(e);
            });
        });
    });

    describe('/fail', function() {
        it('should return a 500 response', function(done) {
            var response = 'failed';

            http.get({
                hostname: 'localhost',
                port: 8765,
                path: '/fail'
            }, function(res) {
                res.statusCode.should.equal(500);
                res.headers['content-type'].should.eql('text/html; charset=utf-8');
                res.headers['content-length'].should.eql(response.length + '');
                res.on('data', function(chunk) {
                    chunk.toString().should.equal(response);
                    done();
                });
            }).on('error', function(e) {
                should.fail(e);
            });
        });
    });

    after(function() {
        server.close();
    });
});
