/* jshint strict: false */
var h = require('hydrogen');

function Cluster(workerFunc, logger, numWorkers) {
    this.cluster = require('cluster');
    this.workerFunc = workerFunc;
    this.log = logger;
    this.numWorkers = numWorkers || require('os').cpus().length;
}

h.attach(Cluster, function closure() {
    var me = this;

    function shutdown() {
        if (this.cluster.isMaster) {
            for (var id in this.cluster.workers) {
                if (this.cluster.workers.hasOwnProperty(id)) {
                    this.cluster.workers[id].kill();
                }
            }
            process.exit(0);
        }
    }

    function attachHandlers(worker) {
        worker.on('online', function onWorkerOnline() {
            me.log.info('Worker ' + worker.process.pid + ' is online');
        });
    }

    function createWorker() {
        var worker = this.cluster.fork();
        attachHandlers.call(this, worker);
    }

    function initCluster() {
        this.cluster.on('exit', function onClusterExit(worker, code, signal) {
            var exitCode = worker.process.exitCode;
            var logMsg = 'Worker ' + worker.process.pid + ' died (exit code: ' + exitCode + ')' +
                (signal ? ' due to signal ' + signal : '');
            if (0 === exitCode) {
                me.log.info(logMsg + '. Shutting down cluster.');
                shutdown.call(me);
            } else {
                me.log.info(logMsg + '. Starting another worker...');
                createWorker.call(me);
            }
        });

        this.log.info('Creating ' + this.numWorkers + ' workers in this cluster...');
        for (var i = 0 ; i < this.numWorkers; i++) {
            createWorker.call(this);
        }
    }

    return {
        start: function start() {
            if (this.cluster.isMaster) {
                initCluster.call(this);
            } else {
                this.workerFunc();
            }
        },

        close: function close() {
            if (this.cluster.isMaster) {
                shutdown.call(this);
            } else {
                process.exit(0);
            }
        }
    };
});

module.exports = Cluster;