/* jshint strict: false */
var domain = require('domain'),
    express = require('express'),
    h = require('hydrogen');

function getDefaultErrorHandler(resp) {
    return function defaultErrorHandler(err, req, res, nextNotUsed) {
        /* jshint unused: false */

        if (res.headersSent) {
            this.log.info('Error encountered during streaming, cannot send suitable status code or content.  ' +
                'Truncating response instead.');
            res.end();
        } else {
            if (req.xhr) {
                resp.sendErrorJSON(res, err, err.status || 500);
            } else {
                resp.sendErrorPage(res, err, err.status || 500);
            }
        }
    };
}

function AppWrapper(appDefFunc, logger, port, responder, errorHandler) {
    this.appDefFunc = appDefFunc;
    this.log = logger;
    this.port = port || 80;

    this.errorHandler = errorHandler || getDefaultErrorHandler(responder);
}

h.attach(AppWrapper, function closure() {
    var me = this;

    function first(app) {
        app.use(function appCreateDomain(req, res, next) {
            var d = domain.create();
            d.add(req);
            d.add(res);

            d.on('error', function onDomainError(err) {
                me.log.fatal('Fatal error occurred: ' + err.stack);
                try {
                    me.errorHandler(err, req, res);
                } catch (err2) {
                    me.log.error('Process that encountered error failed to shut down properly! ' +
                        err2.stack + '\nForce shutdown.');
                } finally {
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