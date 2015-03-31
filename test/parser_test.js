/* global describe, it, beforeEach, afterEach */

'use strict';

var fs = require('fs');
var path = require('path');
var sinon = require('sinon');

describe('parser', function() {
  var parser = require('../lib/parser.js');
  var sample = path.join(__dirname, 'sample');
  var sampleFileNames = fs.readdirSync(sample);
  var temp = path.join(__dirname, 'temp');
  var source = path.join(temp, 'source');
  var destination = path.join(temp, 'destination');

  function rmdir (dir) {
    if (fs.lstatSync(dir).isDirectory()) {
      fs.readdirSync(dir).forEach(function(name) {
        if (fs.lstatSync(path.join(dir, name)).isDirectory()) {
          rmdir(path.join(dir, name));
        } else {
          fs.unlinkSync(path.join(dir, name));
        }
      });

      fs.rmdirSync(dir);
    } else {
      fs.unlinkSync(dir);
    }
  }

  if (fs.existsSync(temp)) {
    rmdir(temp);
  }

  beforeEach(function (done) {
    var count = 0;
    // create temp directory for file operation test
    fs.mkdirSync(temp);
    fs.mkdirSync(source);
    sampleFileNames.forEach(function (name) {
      fs.createReadStream(path.join(sample, name))
        .pipe(fs.createWriteStream(path.join(source, name)))
        .on('finish', function() {
          count += 1;
          if (count === sampleFileNames.length) {
            done();
          }
        });
    });
  });

  afterEach(function () {
    // remove temp directory
    rmdir(temp);
  });

  describe('when traverse is called', function() {
    it('should work without the trailing slash in the source directory', function(done) {
      var count = 0;
      function callback () {
        count+=1;
        if (count === sampleFileNames.length ) {
          done();
        }
      }
      parser.traverse({ source: source }, callback);
    });

    it('should work without the trailing slash in the destination directory', function(done) {
      var count = 0;
      function callback () {
        count+=1;
        if (count === sampleFileNames.length) {
          done();
        }
      }
      parser.traverse({ source: source, destination: destination}, callback);
    });

    it('should create the destination directory if it doesn\'t exist', function(done) {
      var count = 0;
      function callback () {
        count+=1;
        if (count === sampleFileNames.length && fs.existsSync(destination)) {
          done();
        }
      }
      parser.traverse({ source: source, destination: destination }, callback);
    });

    it('should call itself recursively if there is any directory in the source directory and options.recursive is true', function(done) {
      sinon.spy(parser, 'traverse');
      var count = 0;
      function callback () {
        count+=1;
        if (count === sampleFileNames.length + 1) {
          if (parser.traverse.calledTwice) {
            parser.traverse.restore();
            done();
          }
        }
      }
      fs.mkdirSync(path.join(source, 'temp_folder'));
      fs.writeFileSync(path.join(source, 'temp_folder', 'temp.js'), '');
      parser.traverse({ source: source, recursive: true }, callback);
    });

    it('should only call the passed in file operation callback if a file name ends with ".js"', function(done) {
      var count = 0;
      function callback () {
        count+=1;
        if (count === sampleFileNames.length) {
          done();
        }
      }
      fs.writeFileSync(path.join(source, 'temp.txt'), '');
      parser.traverse({ source: source }, callback);
    });
  });

  describe('when parse is called', function() {
    it('should replace debuguy comments with predefined console logs', function() {
      // Add this test when Parser is refactored using Promise
    });
  });

  describe('when autolog is called', function() {
    it('should insert predefined console logs in functions', function() {
      // Add this test when Parser is refactored using Promise
    });
  });
});
