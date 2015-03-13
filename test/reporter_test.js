/*global describe,it*/
'use strict';
var assert = require('assert'),
  Reporter = require('../lib/reporter.js').Reporter;

describe('reporter node module.', function() {
  describe('start function', function() {
    it('should initialize properties', function() {
      var r = new Reporter();
      r.start();
      assert.equal(r.previousTime, 0);
      assert.equal(r.currentPath, 'start');
      // assert.equal(r.previousTime, 0);
    });
  });
});
