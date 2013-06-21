/* jshint strict: false */
var r = {};

function stripNullUndefined(obj) {
    for (var key in obj) {
        if (obj.hasOwnProperty(key) && (undefined === obj[key] || null === obj[key])) {
            delete obj[key];
        }
    }
}

r.sendErrorJSON = function sendErrorJSON(res, err, status) {
    this.sendJSON(res, {
        type: 'error',
        message: err.message
    }, status);
};

r.sendErrorPage = function sendErrorPage(res, err, status) {
    var title = 'Page not found';
    var body = '<h1>Oops, something went wrong</h1>' +
        '<p>' + err.message + '</p>';
    this.sendPage(res, title, body, status);
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

r.sendPage = function sendPage(res, title, body, status) {
    var htmlString = '<!DOCTYPE html><head><title>' + title + '</title></head><body>' + body + '</body></html>';
    this.sendRawPage(res, htmlString, status);
};

r.sendRawPage = function sendPage(res, htmlString, status) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Content-Length', htmlString.length);
    status = status || 200;
    res.send(status, htmlString);
    res.end();
};

module.exports = r;