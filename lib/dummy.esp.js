
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
    .before(function() {
      // Dummy advice only dump this comment.
    })
    .done()
  .done();
};
