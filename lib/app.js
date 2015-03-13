'use strict';
var DOCUMENT_ROOT = __dirname + '/../public';

var defaultOutput = console.log;
var parser = require('./parser');
var server = require('./server');
var version = require('../package').version;
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

module.exports = {
  // args is argument object processed by minimist,
  // please refer to https://github.com/substack/minimist
  run: function(args, output) {
    defaultOutput = output || defaultOutput;
    var displayHelpMenu = this.displayHelpMenu;
    if (args.h || args.help) {
      return displayHelpMenu();
    }

    if (args.v || args.version) {
      return defaultOutput(version);
    }

    if (args._ && args._.length > 0) {
      var command = args._[0];
      // XXX: This is tricky. Because minimist treat first params after
      // -r as value of r. But it is actually sourceDir to us.
      var sourceDir = args.r ? args.r : args._[1];
      var destDir = args.r ? args._[1] : args._[2];
      var parseOption;

      if (command === 'profile') {
        // web and websocket server
        server.start({ documentRoot: DOCUMENT_ROOT});

        var reporter = new (require('./reporter.js').Reporter)();
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
      } else if (command === 'parse') {
        if (sourceDir) {
          parseOption = {
            source: sourceDir,
            destination: destDir,
            recursive: !!args.r
          };
        } else {
          defaultOutput('No source directory specified');
        }

        if (parseOption) {
          parser.parse(parseOption);
        }
      } else if (command === 'autolog') {
        if (sourceDir) {
          parseOption = {
            source: sourceDir,
            destination: destDir,
            recursive: !!args.r
          };
        } else {
          defaultOutput('No source directory specified');
        }

        if (parseOption) {
          parser.autolog(parseOption);
        }
      }
    } else {
      return displayHelpMenu();
    }
  },
  displayHelpMenu: function() {
    var outputMessage = '';
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
    return defaultOutput(outputMessage);
  }
};
