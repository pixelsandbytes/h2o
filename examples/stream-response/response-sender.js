/* jshint strict: false */
var fs = require('fs'),
    Q = require('q');
var r = {};

function stripNullUndefined(obj) {
    for (var key in obj) {
        if (obj.hasOwnProperty(key) && (undefined === obj[key] || null === obj[key])) {
            delete obj[key];
        }
    }
}

/**
 * In this example, I'm streaming contents of files to the client,
 * but this can be any kind of streaming content (a templating library
 * used to construct HTML pages, for example)
 */
function streamFile(res, fileName, status, contentType, prefix, suffix) {
    res.statusCode = status || 200;
    res.setHeader('Content-Type', contentType);
    if (prefix) {
        res.write(prefix);
    }

    var s = fs.createReadStream('templates/' + fileName, {encoding: 'utf8'});
    s.on('readable', function() {
        var buf = s.read();
        if (buf) {
            res.write(buf);
        }
    });
    s.on('end', function() {
        if (suffix) {
            res.write(suffix);
        }
        res.end();
    });
}

r.sendErrorJSON = function sendErrorJSON(res, err, status) {
    this.sendJSON(res, {
        type: 'error',
        message: err.message
    }, status);
};

r.sendJSON = function sendJSON(res, obj, status) {
    stripNullUndefined(obj);
    var respString = JSON.stringify(obj);
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Length', respString.length);
    status = status || 200;
    res.send(status, respString);
    res.end();
};

/**
 * IMPORTANT: if you wish to stream error content to the client
 * (either here in .sendErrorPage or in .sendErrorJSON), you must
 * return a promise instead of void.  In case a fatal error
 * occurred, the promise lets h2o know when the error JSON/page
 * has finished streaming out so it can safely shutdown the process
 * to avoid any unexpected behavior.
 */
r.sendErrorPage = function sendErrorPage(res, err, status) {
    var deferred = Q.defer();

    res.statusCode = status;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');

    var s = fs.createReadStream('templates/error.html', {encoding: 'utf8'});
    s.on('readable', function() {
        var buf = s.read();
        if (buf) {
            res.write(buf);
        }
    });
    s.on('error', function() {
        deferred.reject();
    });
    s.on('end', function() {
        res.end();
        deferred.resolve();
    });

    return deferred.promise;
};

r.sendFileAsJSON = function sendFileAsJSON(res, fileName, status) {
    streamFile(res, fileName, status, 'application/json', '{"content":"', '"}');
};

r.sendFileAsHTML = function sendFileAsHTML(res, fileName, status) {
    streamFile(res, fileName, status, 'text/html; charset=utf-8',
        '<!DOCTYPE html><head><link rel="stylesheet" href="test.css" /></head><body>', '</body></html>');
};

module.exports = r;