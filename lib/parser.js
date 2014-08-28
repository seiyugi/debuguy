/*
 *
 * https://github.com/seiyugi/debuguy
 *
 * Copyright (c) 2014 seiyugi
 * Licensed under the MPL license.
 */

'use strict';

var fs = require('fs');
var regex = /^(\s*)\/\*\sdebuguy\:\stag\((.+)\)\s*\*\/\n/gm;
var outputLine = '$1console.log(\'debuguy,\' + (new Date()).getTime() + \',\' + $2);';

var endsWith = function _endsWith(src, suffix) {
  return src.indexOf(suffix, src.length - suffix.length) !== -1;
};

var parser = {
  parse: function(options) {
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

  }
};

module.exports = parser;
