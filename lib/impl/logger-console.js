/* jshint strict: false */
var clog = {};

clog.info = function info(msg) {
    console.info(msg);
};

clog.warn = function warn(msg) {
    console.warn(msg);
};

clog.error = function info(msg) {
    console.error(msg);
};

clog.fatal = function fatal(msg) {
    console.error(msg);
};

module.exports = clog;