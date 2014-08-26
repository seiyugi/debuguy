#! /usr/bin/env node

'use strict';

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

  var reporter = new (require('./lib/reporter.js').Reporter)();
  process.stdin.resume();
  process.stdin.setEncoding('utf8');
  var buffer = '';
  var lines = [];
  reporter.start();
  process.stdin.on('data', function(chunk) {
    buffer = reporter.analyzeBuffer(buffer, chunk);
    lines.push(buffer);
  });

  process.stdin.on('end', function() {
    reporter.analyzeBuffer(buffer, '\n');
    lines.push(buffer);
    reporter.stop();
    server.broadcast(lines.join('\n'));
  });

  // web and websocket server
  server.start();

} else if (userArgs[2] === 'parse' && dir !== undefined) {
  var out = userArgs[4];
  debuguy.parse(dir, out);
}
