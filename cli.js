#! /usr/bin/env node

'use strict';

var DOCUMENT_ROOT = __dirname + '/public';

var debuguy = require('./lib/debuguy');
var server = require('./lib/server');

var userArgs = process.argv;
var dir = userArgs[3];

var options = {
  profile: {
    name: 'profile',
    usage: '',
    description: 'launch debuguy local profiling report server'
  },
  parse: {
    name: 'parse',
    usage: '[source_dir] [[destination_dir]]',
    description: 'parse javascript from [source_dir] and ' +
      'replace debuguy comments with console.log into ' +
      '[destination_dir]'
  }
};

var displayHelpMenu = function() {
  var outputMessage = '';
  var version = require('./package').version;
  outputMessage += 'debuguy: An unintrusive JavaScript ' +
    'debugging/profiling/log generating tool (' + version + ')';
  outputMessage += '\n\nUsage: ';
  Object.keys(options).forEach(function(key) {
    var option = options[key];
    outputMessage += '\n  debuguy ' + option.name +
      ' ' + option.usage;
    if (option.description) {
      outputMessage += '\n    ' + option.description + '\n';
    }
  });
  return console.log(outputMessage);
};

if (userArgs.indexOf('-h') !== -1 || userArgs.indexOf('--help') !== -1
  || userArgs.length < 3) {
    return displayHelpMenu();
}

if (userArgs.indexOf('-v') !== -1 || userArgs.indexOf('--version') !== -1) {
    return console.log(require('./package').version);
}

if (userArgs[2] === options.profile.name) {

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

} else if (userArgs[2] === options.parse.name && dir !== undefined) {
  var out = userArgs[4];
  debuguy.parse(dir, out);
}
