/* jshint strict: false */
var domain = require('domain'),
    express = require('express'),
    h = require('hydrogen'),
    q = require('q'),
    AsyncError = require('./async-error');


function AppWrapper(appDefFunc, logger, errorHandler, port) {
    this.appDefFunc = appDefFunc;
    this.log = logger;
    this.errorHandler = errorHandler;
    this.port = port || 80;
}

h.attach(AppWrapper, function closure() {
    var me = this;

    function logForceShutdown(err) {
        this.log.error('Process that encountered an error failed to shut down properly! ' +
            err.stack + '\nForce shutdown.');
    }

    function first(app) {
        app.use(function appCreateDomain(req, res, next) {
            var d = domain.create();
            d.add(req);
            d.add(res);

            d.on('error', function onDomainError(err) {
                try {
                    q(me.errorHandler(AsyncError.makeInst(err), req, res))
                        .fail(function(reason) {
                            logForceShutdown.call(me, reason);
                        })
                        .fin(function() {
                            me.log.warn('Domain encountered an error, shutting down...');
                            process.exit(1);
                        });
                } catch (err2) {
                    logForceShutdown.call(me, err2);
                    process.exit(1);
                }
            });

            d.run(next);
        });
    }

    function last(app) {
        app.use(function logErrors(err, req, res, next) {
            me.log.error(err.stack);
            next(err);
        });
        app.use(me.errorHandler);
    }

    return {
        start: function start() {
            var app = express();
            first.call(this, app);
            this.appDefFunc(app);
            last.call(this, app);

            app.listen(this.port);
            this.log.info('Listening on port ' + this.port);
        }
    };
});

module.exports = AppWrapper;