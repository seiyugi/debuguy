#! /usr/bin/env node

'use strict';

var DOCUMENT_ROOT = __dirname + '/public';

var debuguy = require('./lib/debuguy');
var server = require('./lib/server');

var userArgs = process.argv;
var dir = userArgs[3];

if (userArgs.indexOf('-h') !== -1 || userArgs.indexOf('--help') !== -1) {
    return console.log('debuguy help');
}

if (userArgs.indexOf('-v') !== -1 || userArgs.indexOf('--version') !== -1) {
    return console.log(require('./package').version);
}

if (userArgs[2] === 'profile') {

  // web and websocket server
  server.start({ documentRoot: DOCUMENT_ROOT});

  var reporter = new (require('./lib/reporter.js').Reporter)();
  process.stdin.resume();
  process.stdin.setEncoding('utf8');
  var buffer = '';
  reporter.start(server);
  process.stdin.on('data', function(chunk) {
    buffer = reporter.analyzeBuffer(buffer, chunk);
  });

  process.stdin.on('end', function() {
    reporter.analyzeBuffer(buffer, '\n');
    reporter.stop();
  });

} else if (userArgs[2] === 'parse' && dir !== undefined) {
  var out = userArgs[4];
  debuguy.parse(dir, out);
}
