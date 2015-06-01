'use strict';

module.exports = function(filepath, outpath) {
  var opts = {};
  if (outpath) {
    var fs = require('fs');
    opts.writer = {
      write: function(advice) {
        var code = advice.code;
        fs.writeFile(outpath, code);
      }
    };
  }
  var Espect = require('espect.js');
  var espect = new Espect(opts);
  espect
    .select(filepath + ' *')
      .before(function(context) {
        var id = context.meta.id;
        var paths = context.meta.paths;
        // XXX: To assign a result variable to prevent return
        // be splited by comments, which now suffers from the incorrect loc.
        var strpaths = paths.map(function(path) {
          var merged = path.join('.'); return merged; });
        var file = context.meta.file;
        var filepath = file.replace(/\\/g,'/').replace( /.*\//, '' );
        var loc = context.meta.loc;
        // TODO: LOC is incorrect...
        console.log('debuguy,' + Date.now() + ',' +
          filepath + '#' + (id ? id : ('[' + strpaths.join(',') + ']')) +
          '@' + loc.start.line);
      })
    .done()
  .done();
};
