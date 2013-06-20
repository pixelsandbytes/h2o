/* jshint strict: false */
var h = require('hydrogen'),
    loggerInterface = require('./../logger-interface');
var responseSenderInterface = {
    type: 'object',
    contents: {
        sendErrorJSON: {
            type: 'function',
            minArity: 3
        },
        sendErrorPage: {
            type: 'function',
            minArity: 3
        }
    }
};

function checkInterfaceImpl(entity, i) {
    var result = h.checkImpl(entity, i);
    if (true === result) {
        return;
    }
    throw new Error(result);
}

function getErrorHandler(resp, log) {
    checkInterfaceImpl(resp, responseSenderInterface);
    checkInterfaceImpl(log, loggerInterface);

    return function defaultErrorHandler(err, req, res, nextNotUsed) {
        /* jshint unused: false */

        if (res.headersSent) {
            log.info('Error encountered during streaming, cannot send suitable status code or content.  ' +
                'Truncating response instead.');
            res.end();
        } else {
            if (req.xhr) {
                return resp.sendErrorJSON(res, err, err.status || 500);
            } else {
                return resp.sendErrorPage(res, err, err.status || 500);
            }
        }
    };
}

module.exports = getErrorHandler;