#! /usr/bin/env node

'use strict';

var debuguy = require('./lib/debuguy');

var userArgs = process.argv;
var searchParam = userArgs[2];

if (userArgs.indexOf('-h') !== -1 || userArgs.indexOf('--help') !== -1 || searchParam === undefined) {
    return console.log('cli help');
}

if (userArgs.indexOf('-v') !== -1 || userArgs.indexOf('--version') !== -1) {
    return console.log(require('./package').version);
}

if (userArgs[2] === 'reporter') {

  var reporter = new (require('./lib/reporter.js').Reporter)();
  process.stdin.resume();
  process.stdin.setEncoding('utf8');
  var buffer = '';
  reporter.start();
  process.stdin.on('data', function(chunk) {
    buffer = reporter.analyzeBuffer(buffer, chunk);
  });

  process.stdin.on('end', function() {
    reporter.analyzeBuffer(buffer, '\n');
    reporter.stop();
  });
}
