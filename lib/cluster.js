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
            me.log.info('Worker ' + worker.process.pid + ' died (exit code: ' + exitCode + ')' +
                (signal ? ' due to signal ' + signal : ''));
        });
        this.cluster.on('disconnect', function onClusterDisconnect(worker) {
            me.log.info('Worker ' + worker.process.pid + ' disconnected. Starting another worker...');
            createWorker.call(me);
        });

        me.log.info('Creating ' + this.numWorkers + ' workers in this cluster...');
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
        }
    };
});

module.exports = Cluster;