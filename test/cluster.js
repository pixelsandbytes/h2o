require('should');
var Cluster = require('../lib/cluster.js'),
    sinon = require('sinon');

/* global describe, before, it, after */
describe('Cluster', function() {
    'use strict';

    describe('#start', function() {

        describe('For worker process', function() {
            var workerFunc, cluster;

            before(function() {
                workerFunc = sinon.spy();
                cluster = Cluster.makeInst(workerFunc);
                cluster.cluster = {
                    isMaster: false
                };
            });

            it('should call worker function once', function() {
                cluster.start();
                workerFunc.calledOnce.should.equal(true);
            });
        });

        describe('For master process', function() {
            var workerStub, log, cluster;

            before(function() {
                workerStub = {
                    on: sinon.spy()
                };
                log = {
                    info: sinon.spy()
                };
                cluster = Cluster.makeInst(null, log);
                cluster.cluster = {
                    isMaster: true,
                    on: sinon.spy(),
                    fork: sinon.stub().returns(workerStub)
                };
            });

            it('should initialize cluster', function() {
                var expectedNumWorkers = require('os').cpus().length;
                cluster.start();
                cluster.cluster.on.calledOnce.should.equal(true, 'this.cluster.on should be called once');
                cluster.cluster.on.calledWith('exit').should.equal(true,
                    'this.cluster.on should be called with "exit"');
                cluster.log.info.calledOnce.should.equal(true, 'this.log.info should be called once');
                cluster.cluster.fork.callCount.should.equal(expectedNumWorkers,
                    'this.cluster.fork should be called ' + expectedNumWorkers + ' times');
                workerStub.on.callCount.should.equal(expectedNumWorkers,
                    'worker.on should be called ' + expectedNumWorkers + ' times in total');
                workerStub.on.calledWith('online').should.equal(true,
                    'worker.on should be called with "online"');
            });
        });

        describe('For master process with # workers specified', function() {
            var numWorkers, cluster;

            before(function() {
                numWorkers = require('os').cpus().length + 2;
                cluster = Cluster.makeInst(null, {
                    info: sinon.spy()
                }, numWorkers);
                cluster.cluster = {
                    isMaster: true,
                    on: sinon.spy(),
                    fork: sinon.stub().returns({
                        on: sinon.spy()
                    })
                };
            });

            it('should initialize cluster', function() {
                cluster.start();
                cluster.cluster.fork.callCount.should.equal(numWorkers);
            });
        });

    });

    describe('#close', function() {

        describe('For worker process', function() {
            var exitOrgFunc, cluster;

            before(function() {
                cluster = Cluster.makeInst();
                cluster.cluster = {
                    isMaster: false
                };
                exitOrgFunc = process.exit;
                process.exit = sinon.spy();
            });

            it('should exit the process', function() {
                cluster.close();
                process.exit.calledOnce.should.equal(true,
                    'process.exit should be called once');
                process.exit.calledWith(0).should.equal(true,
                    'process.exit should be called with zero');
            });

            after(function() {
                process.exit = exitOrgFunc;
            });
        });

        describe('For master process', function() {
            var exitOrgFunc, cluster;

            before(function() {
                cluster = Cluster.makeInst();
                cluster.cluster = {
                    isMaster: true,
                    workers: {
                        123: {kill: sinon.spy()},
                        abc: {kill: sinon.spy()}
                    }
                };
                exitOrgFunc = process.exit;
                process.exit = sinon.spy();
            });

            it('should shutdown the cluster', function() {
                cluster.close();
                for (var id in cluster.cluster.workers) {
                    if (cluster.cluster.workers.hasOwnProperty(id)) {
                        cluster.cluster.workers[id].kill.calledOnce.should.equal(true,
                            'kill() of worker ' + id + ' should be called once');
                    }
                }
                process.exit.calledOnce.should.equal(true,
                    'process.exit should be called once');
                process.exit.calledWith(0).should.equal(true,
                    'process.exit should be called with zero');
            });

            after(function() {
                process.exit = exitOrgFunc;
            });
        });

    });

});