/*
 *
 * https://github.com/seiyugi/debuguy
 *
 * Copyright (c) 2014 seiyugi
 * Licensed under the MPL license.
 */

'use strict';

var fs = require('fs');
var regex = /^(\s*)\/\*\sdebuguy\:\stag\((.+)\)\s*\*\//;
var outputLine = '$1console.log(\'debuguy\', (new Date()).getTime(), $2);';

var debuguy = {
  parse: function(dir, out) {
    fs.readdir(dir, function (err, list) {
      if (err) {
        console.log(err);
        return;
      }

      if (!out) {
        out = dir + 'output/';
      }

      fs.exists(out, function (exists) {
        if (!exists) {
          // change it to async mkdir later
          fs.mkdirSync(out);
        }
      });

      list.filter(function(item) {
        fs.readFile(dir+item, function (err, data) {

          if (err) {
            console.log(err);
            console.log(data);
            return;
          }

          var txt = data.toString();
          var lines = txt.split('\n');
          var outputLines = [];

          lines.forEach(function (line) {
            // console.log(line);
            line = line.replace(regex, outputLine);
            outputLines.push(line);
          });

          fs.writeFile(out + item, outputLines.join('\n'), function(err) {
            if (err) {
              console.log(err);
            } else {
              console.log("The file was saved!");
            }
          });

          });

        });
    });

  }
};

module.exports = debuguy;
