/* jshint strict: false */
var h = require('hydrogen');

function AsyncError(err) {
    this.err = err;
    this.message = err.message;
    this.stack = err.stack;
}
h.create(AsyncError, Error, {});

module.exports = AsyncError;