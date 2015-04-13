/* global describe, it, before, after, beforeEach, afterEach */
'use strict';
var sinon = require('sinon');
/* jshint ignore:start */
var should = require('should');
/* jshint ignore:end */
var proxyquire = require('proxyquire');
var version = require('../package').version;

describe('app', function() {
  var functionStub = function() {};
  var serverStub = {
    start: functionStub
  };
  var reporterStub = {
    Reporter: functionStub,
    start: functionStub,
    analyzeBuffer: functionStub,
    stop: functionStub
  };
  var parserStub = {
    parse: functionStub,
    autolog: functionStub
  };
  var app = proxyquire('../lib/app', {
    './server': serverStub,
    './reporter': reporterStub,
    './parser': parserStub
  });

  before(function() {
    sinon.stub(process.stdin, 'resume');
    sinon.stub(process.stdin, 'setEncoding');
    sinon.stub(process.stdin, 'on');
  });
  after(function() {
    process.stdin.resume.restore();
    process.stdin.setEncoding.restore();
    process.stdin.on.restore();
  });

  describe('(simple parameters)', function() {
    var mockConsoleLog = function() {};
    var consoleLogSpy;

    beforeEach(function() {
      consoleLogSpy = sinon.spy(mockConsoleLog);
    });

    afterEach(function() {
      consoleLogSpy = undefined;
    });

    it('should print help menu if no arg provided', function() {
      app.run({_: []}, consoleLogSpy);
      consoleLogSpy.calledOnce.should.be.exactly(true);
      consoleLogSpy.getCall(0).args[0].should.startWith(
        'debuguy: An unintrusive JavaScript debugging/profiling/log generating tool');
    });

    it('should print help menu if "-h"', function() {
      app.run({h: true}, consoleLogSpy);
      consoleLogSpy.calledOnce.should.be.exactly(true);
      consoleLogSpy.getCall(0).args[0].should.startWith(
        'debuguy: An unintrusive JavaScript debugging/profiling/log generating tool');
    });

    it('should print help menu if "--help"', function() {
      app.run({help: true}, consoleLogSpy);
      consoleLogSpy.calledOnce.should.be.exactly(true);
      consoleLogSpy.getCall(0).args[0].should.startWith(
        'debuguy: An unintrusive JavaScript debugging/profiling/log generating tool');
    });

    it('should print version if "-v" specified', function() {
      app.run({v: true}, consoleLogSpy);
      consoleLogSpy.calledOnce.should.be.exactly(true);
      consoleLogSpy.getCall(0).args[0].should.equal(version);
    });

    it('should print version if "--version" specified', function() {
      app.run({version: true}, consoleLogSpy);
      consoleLogSpy.calledOnce.should.be.exactly(true);
      consoleLogSpy.getCall(0).args[0].should.equal(version);
    });
  });

  describe('(with subcommand)', function() {
    var serverStartSpy, reporterStartSpy, parserParseSpy, parserAutologSpy;

    before(function() {
      serverStartSpy = sinon.spy(serverStub, 'start');
      reporterStartSpy = sinon.spy(reporterStub, 'start');
      parserParseSpy = sinon.spy(parserStub, 'parse');
      parserAutologSpy = sinon.spy(parserStub, 'autolog');
    });

    afterEach(function() {
      serverStartSpy.reset();
      reporterStartSpy.reset();
      parserParseSpy.reset();
      parserAutologSpy.reset();
    });

    it('should start profiling if "profile" specified', function() {
      app.run({
        _: ['profile']
      });
      serverStartSpy.calledOnce.should.be.exactly(true);
      serverStartSpy.getCall(0).args[0].should.have.property('documentRoot');
      serverStartSpy.getCall(0).args[0].documentRoot.should.endWith(
        '/../public');
    });

    it('should call parser if "parse" specified', function() {
      var sourceDir = 'some_random_directory';
      app.run({
        _: ['parse', sourceDir]
      });
      parserParseSpy.calledOnce.should.be.exactly(true);
      var params = parserParseSpy.getCall(0).args[0];
      params.should.have.property('source');
      params.source.should.equal(sourceDir);
      params.should.have.property('recursive');
      params.recursive.should.be.exactly(false);
    });

    it('should call parser with recursive=true if "parse" and "-r" specified',
      function () {
        var sourceDir = 'some_random_directory';
        app.run({
          _: ['parse', sourceDir],
          // XXX: This is tricky. Because minimist treat first params after
          // -r as value of r. But it is actually sourceDir to us.
          r: true
        });
        parserParseSpy.calledOnce.should.be.exactly(true);
        var params = parserParseSpy.getCall(0).args[0];
        params.should.have.property('source');
        params.source.should.equal(sourceDir);
        params.should.have.property('recursive');
        params.recursive.should.be.exactly(true);
      }
    );

    it('should call autolog if "autolog" specified', function() {
      var sourceDir = 'some_random_directory';
      app.run({
        _: ['autolog', sourceDir]
      });
      parserAutologSpy.calledOnce.should.be.exactly(true);
      var params = parserAutologSpy.getCall(0).args[0];
      params.should.have.property('source');
      params.source.should.equal(sourceDir);
      params.should.have.property('recursive');
      params.recursive.should.be.exactly(false);
    });

    it ('should call autolog with recursive=true if "autolog" and "-r" specified',
      function () {
        var sourceDir = 'some_random_directory';
        app.run({
          _: ['autolog', sourceDir],
          // XXX: This is tricky. Because minimist treat first params after
          // -r as value of r. But it is actually sourceDir to us.
          r: true
        });
        parserAutologSpy.calledOnce.should.be.exactly(true);
        var params = parserAutologSpy.getCall(0).args[0];
        params.should.have.property('source');
        params.source.should.equal(sourceDir);
        params.should.have.property('recursive');
        params.recursive.should.be.exactly(true);
      }
    );

    it ('should call autolog with callStackGraph=true if "autolog" and "-c" specified',
      function () {
        var sourceDir = 'some_random_directory';
        app.run({
          _: ['autolog', sourceDir],
          // XXX: This is tricky. Because minimist treat first params after
          // -r as value of r. But it is actually sourceDir to us.
          c: true
        });
        parserAutologSpy.calledOnce.should.be.exactly(true);
        var params = parserAutologSpy.getCall(0).args[0];
        params.should.have.property('source');
        params.source.should.equal(sourceDir);
        params.should.have.property('callStackGraph');
        params.callStackGraph.should.be.exactly(true);
      }
    );
  });

});
