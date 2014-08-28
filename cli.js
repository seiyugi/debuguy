#! /usr/bin/env node

/**
 * Parsing:
 *
 * $ debuguy parse <source_dir>
 * $ debuguy parse <source_dir> <destination_dir>
 * $ debuguy parse -r <source_dir>
 * $ debuguy parse -r <source_dir> <destination_dir>
 *
 * Profiling:
 *
 * $ <stream> | debuguy profile
 *
 */

'use strict';

var DOCUMENT_ROOT = __dirname + '/public';

var parser = require('./lib/parser');
var server = require('./lib/server');

var userArgs = process.argv;

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
  },
  autolog: {
    name: 'autolog',
    usage: '[source_dir] [[destination_dir]]',
    description: 'parse all functions and auto add console log for debuguy'
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

} else if (userArgs[2] === options.parse.name) {

  var parseOption;

  if (userArgs.indexOf('-r') !== -1 && userArgs[4] !== undefined) {
    parseOption = {
      source: userArgs[4],
      destination: userArgs[5],
      recursive: true
    };
  } else if (userArgs[3] !== undefined) {
    parseOption = {
      source: userArgs[3],
      destination: userArgs[4]
    };
  } else {
    console.log('No source directory specified');
  }

  if (parseOption) {
    parser.parse(parseOption);
  }

} else if (userArgs[2] === options.autolog.name) {
  var parseOption;

  if (userArgs.indexOf('-r') !== -1 && userArgs[4] !== undefined) {
    parseOption = {
      source: userArgs[4],
      destination: userArgs[5],
      recursive: true
    };
  } else if (userArgs[3] !== undefined) {
    parseOption = {
      source: userArgs[3],
      destination: userArgs[4]
    };
  } else {
    console.log('No source directory specified');
  }

  if (parseOption) {
    parser.autolog(parseOption);
  }
}
