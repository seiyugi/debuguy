/*
 *
 * https://github.com/seiyugi/debuguy
 *
 * Copyright (c) 2014 seiyugi
 * Licensed under the MPL license.
 */

'use strict';

var fs = require('fs');
var esprima = require('esprima');
var falafel = require('falafel');

var regex = /^(\s*)\/\*\sdebuguy\:\stag\((.+)\)\s*\*\/\n/gm;
var outputLine = '$1console.log(\'debuguy,\' + (new Date()).getTime() + \',\' + $2);';

var endsWith = function _endsWith(src, suffix) {
  return src.indexOf(suffix, src.length - suffix.length) !== -1;
};

var parser = {
  parse: function pr_parse(options) {
    var dir = options.source;
    var out = options.destination;
    var recursive = options.recursive;

    fs.readdir(dir, function(err, list) {
      if (err) {
        console.log(err);
        return;
      }

      dir = endsWith(dir, '/') ? dir : dir + '/';

      out = out || dir;

      fs.exists(out, function(exists) {
        if (!exists) {
          // change it to async mkdir later
          fs.mkdirSync(out);
        }
      });

      list.forEach(function(item) {
        // if the item is a directory
        if (fs.lstatSync(dir + item).isDirectory()) {
          if (recursive) {
            parser.parse({
              source: dir + item,
              recursive: recursive
            });

            return;
          }
        }

        fs.readFile(dir + item, function(err, data) {

          if (err) {
            console.log(err);
            console.log(data);
            return;
          }

          var txt = data.toString();

          // if no match in the file
          if (!txt.match(regex)) {
            return;
          }

          fs.writeFile(out + item, txt.replace(regex, outputLine), function(err) {
            if (err) {
              console.log(err);
            } else {
              console.log(out + item + ' was saved!');
            }
          });

        });

      });
    });

  },

  autolog: function pr_autolog(options) {
    var dir = options.source;
    var out = options.destination;
    var recursive = options.recursive;
    // read source folder to find js files
    fs.readdir(dir, function(err, list) {
      if (err) {
        console.log(err);
        return;
      }


      dir = endsWith(dir, '/') ? dir : dir + '/';

      out = out || dir;

      fs.exists(out, function(exists) {
        if (!exists) {
          // change it to async mkdir later
          fs.mkdirSync(out);
        }
      });


      // read each files
      list.forEach(function(item) {
        // if the item is a directory
        if (fs.lstatSync(dir + item).isDirectory()) {
          if (recursive) {
            parser.parse({
              source: dir + item,
              recursive: recursive
            });

            return;
          }
        }

        //  check file extension is fs
        if (!endsWith(item, 'js')) {
          return;
        }

        fs.readFile(dir + item, function(err, data) {
          if (err) {
            console.log(err);
            console.log(data);
            return;
          }

          var text = data.toString();

          var output = falafel(text, function (node) {
            if (node.type === 'ArrowFunctionExpression' ||
                node.type === 'FunctionDeclaration' ||
                node.type === 'FunctionExpression') {
                var fnoutLine = '\nconsole.log("debuguy,"'
                 + '+ (new Date()).getTime() + ",' +
                  (node.id ? node.id.name : 'anonymous') + '");';
                
                var startLine = node.source().indexOf('{') + 1;
                var source = node.source().substr(0, startLine) + fnoutLine
                                           + node.source().substr(startLine);
                node.update(source);
                console.log(node.id.name);
            }
          });

          fs.writeFile(out + item, output, function(err) {
            if (err) {
              console.log(err);
            } else {
              console.log(out + item + ' was saved!');
            }
          });

        });


      });


    });
  },
};

module.exports = parser;
