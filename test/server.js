require('should');
var h2o = require('../lib/server.js'),
	Cluster = require('../lib/cluster.js'),
	http = require('http');

/* global describe, it, after */
describe('#setAppDefiner', function() {
	'use strict';

	describe('Given a function that accepts 1 parameter', function() {
		it('should pass', function() {
			var testFunc = function() {
				/* jshint unused:false */
				h2o().setAppDefiner(function(param) {});
			};
			testFunc.should.not.throwError();
		});
	});

	describe('Given a function that accepts 2 parameters', function() {
		it('should pass', function() {
			var testFunc = function() {
				/* jshint unused:false */
				h2o().setAppDefiner(function(a, b) {});
			};
			testFunc.should.not.throwError();
		});
	});

	describe('Given a function that accepts no parameters', function() {
		it('should throw error', function() {
			var testFunc = function() {
				h2o().setAppDefiner(function() {});
			};
			testFunc.should.throwError();
		});
	});

	describe('Given a value', function() {
		it('should throw error', function() {
			var testFunc = function() {
				h2o().setAppDefiner('not a function');
			};
			testFunc.should.throwError();
		});
	});
});

describe('#setLogger', function() {
	'use strict';

	describe('Given an object with info(), warn(), error(), and fatal(); each accept 1 parameter', function() {
		it('should pass', function() {
			var testFunc = function() {
				/* jshint unused:false */
				h2o().setLogger({
					info: function(msg) {},
					warn: function(msg) {},
					error: function(msg) {},
					fatal: function(msg) {}
				});
			};
			testFunc.should.not.throwError();
		});
	});

	describe('Given an object with info(), warn(), error(), and fatal(), with other properties', function() {
		it('should pass', function() {
			var testFunc = function() {
				/* jshint unused:false */
				h2o().setLogger({
					info: function(msg) {},
					warn: function(msg) {},
					error: function(msg) {},
					fatal: function(msg) {},
					extra: 'irrelevant'
				});
			};
			testFunc.should.not.throwError();
		});
	});

	describe('Given an object with info(), warn(), error(), and fatal(); some do not accept 1 parameter', function() {
		it('should throw error', function() {
			var testFunc = function() {
				/* jshint unused:false */
				h2o().setLogger({
					info: function(msg) {},
					warn: function(msg) {},
					error: function(msg) {},
					fatal: function() {}
				});
			};
			testFunc.should.throwError();
		});
	});

	describe('Given an object with info(), warn(), error(), and fatal', function() {
		it('should throw error', function() {
			var testFunc = function() {
				/* jshint unused:false */
				h2o().setLogger({
					info: function(msg) {},
					warn: function(msg) {},
					error: function(msg) {},
					fatal: 'not a function'
				});
			};
			testFunc.should.throwError();
		});
	});

	describe('Given an object with info(), warn(), and error() only', function() {
		it('should throw error', function() {
			var testFunc = function() {
				/* jshint unused:false */
				h2o().setLogger({
					info: function(msg) {},
					warn: function(msg) {},
					error: function(msg) {}
				});
			};
			testFunc.should.throwError();
		});
	});

	describe('Given a function (i.e. non-object)', function() {
		it('should throw error', function() {
			var testFunc = function() {
				/* jshint unused:false */
				h2o().setLogger(function() {});
			};
			testFunc.should.throwError();
		});
	});
});

describe('#setErrorHandler', function() {
	'use strict';

	describe('Given a function that accepts 4 parameters', function() {
		it('should pass', function() {
			var testFunc = function() {
				/* jshint unused:false */
				h2o().setErrorHandler(function(a, b, c, d) {});
			};
			testFunc.should.not.throwError();
		});
	});

	describe('Given a function that accepts 5 parameters', function() {
		it('should pass', function() {
			var testFunc = function() {
				/* jshint unused:false */
				h2o().setErrorHandler(function(a, b, c, d, e) {});
			};
			testFunc.should.not.throwError();
		});
	});

	describe('Given a function that accepts 3 parameters', function() {
		it('should throw error', function() {
			var testFunc = function() {
				/* jshint unused:false */
				h2o().setErrorHandler(function(a, b, c) {});
			};
			testFunc.should.throwError();
		});
	});

	describe('Given a value', function() {
		it('should throw error', function() {
			var testFunc = function() {
				h2o().setErrorHandler('not a function');
			};
			testFunc.should.throwError();
		});
	});
});

describe('#run', function() {
	'use strict';

	function makeServer() {
		/* jshint unused:false */
		return h2o()
			.setAppDefiner(function(param) {})
			.setLogger({
				info: function(msg) {},
				warn: function(msg) {},
				error: function(msg) {},
				fatal: function(msg) {}
			})
			.setErrorHandler(function(a, b, c, d) {});
	}

	describe('With cluster', function() {
		it('should return a Cluster', function() {
			var result = makeServer().run();
			result.should.be.an.instanceOf(Cluster);
		});
	});

	describe('Without cluster', function() {
		var result;

		it('should return an HTTP server', function() {
			result = makeServer()
				.setClusterUse(false)
				.run();
			result.should.be.an.instanceOf(http.Server);
		});

		after(function() {
			result.close();
		});
	});
});