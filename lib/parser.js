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

var regex = /^(\s*)\/\*\sdebuguy\:\stag\((.+)\)\s*\*\/\n/gm;

var replacer = function _replacer(match, p1, p2) {
  var outputLine = '';
  // the first match
  outputLine = p1 + 'console.log(\'debuguy,\' + (new Date()).getTime()';

  // the debuguy tag arguments
  var args = p2.split(',');

  args.forEach(function (match) {
    match = match.trim();
    outputLine = outputLine + ' + \',\' + ' + match;
  });

  outputLine += ');\n';

  return outputLine;
};

var endsWith = function _endsWith(src, suffix) {
  return src.indexOf(suffix, src.length - suffix.length) !== -1;
};

function esprimaTraversal(src, options) {
  options = options || {};
  options.range = true;

  // abstact syntax tree
  var ast = esprima.parse(src, options);

  var chunks = src.split('');

  var result = {
    toString: function() { return chunks.join(''); }
  };

  function extendNode (node, parent) {
    node.parent = parent;

    node.getSource = function () {
      return chunks.slice(node.range[0], node.range[1]).join('');
    };

    node.updateSource = function (text) {
      chunks[node.range[0]] = text;
      for (var i = node.range[0] + 1; i < node.range[1]; i++) {
        chunks[i] = '';
      }
    };
  }

  function esprimaTraversal_traverse(callback) {

    (function traverse (node, parent) {
      Object.keys(node).forEach(function (key) {
        if (key === 'range' || key === 'parent') {
          return;
        }

        var child = node[key];

        // Fix duplicate logs in try/catch blocks
        // https://github.com/jquery/esprima/issues/1030
        // workaround for esprima changes for TryStatement using 'handler' instead of 'handlers'
        if (Array.isArray(child) && !(key === 'handlers' && node.type === 'TryStatement')) {
          child.forEach(function(grandchild) {
            if (typeof grandchild.type === 'string') {
              traverse(grandchild, child);
            }
          });
        } else if (child && typeof child.type === 'string') {
          traverse(child, node);
        }
      });

      extendNode(node, parent);

      callback(node);
    })(ast);

    return result;
  }

  return {
    traverse: esprimaTraversal_traverse
  };
}

function Parser () {}

Parser.prototype = {
  /**
   * Traverse the input directory to get javascript files and run the passed in file operation.
   * @param  {[type]} options       [description]
   * @param  {[type]} fileOperation [description]
   * @return {[type]}               [description]
   */
  traverse: function pr_traverse(options, fileOperation) {
    fileOperation = fileOperation || function () {};

    var dir = options.source;
    var out = options.destination;
    var recursive = options.recursive;

    var self = this;

    // read source folder to find js files
    fs.readdir(dir, function(err, list) {
      if (err) {
        if (endsWith(dir, '.js')) {
          var lastIndex = dir.lastIndexOf('/');
          out = out || dir.substring(0, lastIndex);
          fileOperation(dir.substring(0, lastIndex), dir.substring(lastIndex), out);
          return;
        }

        console.log(err);
        return;
      }

      dir = endsWith(dir, '/') ? dir : dir + '/';
      if (out) {
        out = endsWith(out, '/') ? out : out + '/';
      } else {
        out = dir;
      }

      fs.exists(out, function(exists) {
        if (!exists) {
          // change it to async mkdir later
          fs.mkdirSync(out);
        }

        // read each files
        list.forEach(function(item) {
          // if the item is a directory
          if (fs.lstatSync(dir + item).isDirectory() && recursive) {
            self.traverse({
              source: dir + item,
              destination: out + item,
              recursive: recursive
            }, fileOperation);
          } else if (endsWith(item, 'js')) {
            fileOperation(dir, item, out);
          }
        });
      });
    });
  },
  /**
   * Replace debuguy comments to predifined condole logs.
   * @param  {[type]} options [description]
   * @return {[type]}         [description]
   */
  parse: function pr_parse(options) {
    this.traverse(options, function (dir, item, out) {
      fs.readFile(dir + item, function(err, data) {
        console.log('adding log ' + dir + item);

        if (err) {
          console.log(err);
          console.log(data);
          return;
        }

        var source = data.toString();
        var output;

        // if no match in the file
        if (!source.match(regex)) {
          return;
        }

        output = source.replace(regex, replacer);

        fs.writeFile(out + item, output, function(err) {
          if (err) {
            console.log(err);
          } else {
            console.log(out + item + ' was saved!');
          }
        });
      });
    });
  },
  /**
   * Automatically insert console logs in javascript functions.
   * @param  {[type]} options [description]
   * @return {[type]}         [description]
   */
  autolog: function pr_autolog(options) {
    function insertReturnLog(source, endLine) {
      var sourceRet;
      // Insert ending log at return statement.
      sourceRet = source.replace(/(\s|;)return(\s|;)/g, "$1" + endLine + "return$2");

      // Remove any ending log that added twice.
      while(sourceRet.indexOf(endLine + endLine) !== -1) {
        sourceRet = sourceRet.replace(endLine + endLine, endLine);
      }
      return sourceRet;
    }

    this.traverse(options, function insertLog (dir, item, out) {
      fs.readFile(dir + item, function(err, data) {
        console.log('adding log ' + dir + item);

        if (err) {
          console.log(err);
          console.log(data);
          return;
        }

        var text = data.toString();
        var output;

        try {
          output = esprimaTraversal(text, {loc:true})
            .traverse(function (node) {
            if (node.type === 'ArrowFunctionExpression' ||
                node.type === 'FunctionDeclaration' ||
                node.type === 'FunctionExpression') {
              // Get the name of the function
              var functionName = 'anonymous';
              if (node.id) {
                functionName = node.id.name;
              } else if (node.parent) {
                switch (node.parent.type) {
                case 'VariableDeclarator':
                  functionName = node.parent.id.name;
                  break;
                case 'Property':
                  functionName = node.parent.key.name;
                  break;
                case 'AssignmentExpression':
                  if (node.parent.left.type === 'MemberExpression') {
                    functionName = node.parent.left.property.name ||
                                   node.parent.left.property.value;
                  }
                  else if (node.parent.left.type === 'Identifier') {
                    functionName = node.parent.left.name;
                  }
                  break;
                }
              }
              // Build the console log output
              var fnoutLine = 'var DEBOUT="debuguy,"' +
                ' + (new Date()).getTime() + ",' +
                item.substring(0, item.lastIndexOf('.')) + '.' +
                functionName + '@' +
                node.loc.start.line + '";console.log(DEBOUT + ",ENTER");';
              var fnEndLine = 'console.log(DEBOUT + ",LEAVE");';

              var startLine = node.getSource().indexOf('{') + 1;
              var endLine = node.getSource().lastIndexOf('}');
              var source = node.getSource().substr(0, startLine) + fnoutLine +
                           node.getSource().substr(startLine, endLine - startLine) + fnEndLine +
                           node.getSource().substr(endLine);
              source = insertReturnLog(source, fnEndLine);
              node.updateSource(source);
            }
          });

          fs.writeFile(out + item, output, function(err) {
            if (err) {
              console.log(err);
            } else {
              console.log(out + item + ' was saved!');
            }
          });
        }
        catch (e) {
          console.log('parsing failed: ' + dir + item);
          console.log(e);
        }
      });
    });
  }
};

module.exports = new Parser();
