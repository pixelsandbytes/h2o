/* jshint strict: false */
var h = require('hydrogen'),
    AppWrapper = require('./app-wrapper');

var interfaces = {
    appDefiner: {
        type: 'function',
        minArity: 1
    },
    logger: require('./logger-interface'),
    errorHandler: {
        type: 'function',
        minArity: 4
    }
};

function checkInterfaceImpl(entity, i) {
    var result = h.checkImpl(entity, i);
    if (true === result) {
        return;
    }
    throw new Error(result);
}

function Server() {
    this.appDefFunc = null;
    this.logger = null;
    this.errorHandler = null;

    this.port = 80;
    this.useCluster = true;
    this.numWorkersInCluster = undefined;
}

h.create(Server, {

    setAppDefiner: function setAppDefiner(appDefFunc) {
        checkInterfaceImpl(appDefFunc, interfaces.appDefiner);
        this.appDefFunc = appDefFunc;
        return this;
    },

    setLogger: function setLogger(logger) {
        checkInterfaceImpl(logger, interfaces.logger);
        this.logger = logger;
        return this;
    },

    setErrorHandler: function setErrorHandler(errorHandler) {
        checkInterfaceImpl(errorHandler, interfaces.errorHandler);
        this.errorHandler = errorHandler;
        return this;
    },

    setPort: function setPort(port) {
        this.port = port;
        return this;
    },

    setClusterUse: function setClusterUse(useCluster) {
        this.useCluster = useCluster;
        return this;
    },

    setNumWorkersInCluster: function setNumWorkersInCluster(numWorkers) {
        this.numWorkersInCluster = numWorkers;
        return this;
    },

    run: function run() {
        var app = AppWrapper.makeInst(this.appDefFunc, this.logger, this.errorHandler, this.port);

        if (this.useCluster) {
            var Cluster = require('./cluster.js');
            var cluster = Cluster.makeInst(function() {
                app.start();
            }, this.logger, this.numWorkersInCluster);
            cluster.start();
        } else {
            app.start();
        }
    }

});

function server() {
    return Server.makeInst();
}

function getUtilModules() {
    var fs = require('fs'),
        path = require('path');

    var utilsDir = path.join(__dirname, 'impl'),
        files = fs.readdirSync(utilsDir),
        utilModules = {};

    for (var i = 0; i < files.length; i++) {
        var fileName = files[i],
            filePath = path.join(utilsDir, fileName),
            fileStat = fs.statSync(filePath),
            moduleName;
        if (fileStat.isFile() && fileName.match(/\.js$/)) {
            moduleName = fileName.substring(0, fileName.length - 3);
            utilModules[moduleName] = require(filePath);
        }
    }
    return utilModules;
}

module.exports = server;
module.exports.utils = getUtilModules();
