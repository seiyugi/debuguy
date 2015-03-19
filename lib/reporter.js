
/*
 *
 * https://github.com/seiyugi/debuguy
 *
 * Copyright (c) 2014 seiyugi
 * Licensed under the MPL license.
 */


'use strict';

var Reporter = function() {};

Reporter.TOKEN = 'debuguy';

Reporter.prototype.start = function(server) {
  this.previousTime = 0;
  this.currentPath = 'start';
  this.pathObj = {};
  this.eventList = [];
  this.server = server;
  console.log('start reading information from pipe.');
};

Reporter.prototype.parseLine = function(line) {
  var startIdx = line.indexOf(Reporter.TOKEN + ',');
  if (startIdx === -1) {
    return;
  }
  var data = line.substr(startIdx + Reporter.TOKEN.length + 1).split(',');
  return {
    'time': data.splice(0, 1)[0],
    'type': data[data.length - 1].trim(),
    'path': data[0].split('.')
  };
};

Reporter.prototype.pathToString = function(path) {
  return path.join('-');
};

Reporter.prototype.putSample = function(data) {
  var timeDiff = data.time - this.previousTime;
  var pathKey = this.pathToString(this.currentPath) + '=>' +
                this.pathToString(data.path);
  if (!this.pathObj[pathKey]) {
    this.pathObj[pathKey] = {
      'from' : [].concat(this.currentPath),
      'to': [].concat(data.path),
      'samples': []
    };
  }
  var samples = this.pathObj[pathKey].samples;
  samples[samples.length] = timeDiff;
};

Reporter.prototype.analyzeBuffer = function(buffer, chunk) {
  var lines = (buffer + chunk).split('\n');
  for (var i = 0; i < lines.length - 1; i++) {
    if (!lines[i]) {
      // empty line
      continue;
    }
    var data = this.parseLine(lines[i]);
    if (!data) {
      continue;
    }
    this.eventList[this.eventList.length] = data;

    this.server.broadcast(data);
  //   if (this.previousTime) {
  //     this.putSample(data);
  //   }
  //   this.previousTime = data.time;
  //   this.currentPath = data.path;
  }
  // if (this.eventList.length % 10 === 0) {
  //   this.dumpAllBehaviors();
  // }
  return lines[lines.length - 1];
};

Reporter.prototype.dumpAllBehaviors = function() {
  function reduceFunc(prev, now) {
    return prev + now;
  }

  for(var key in this.pathObj) {
    var samples = this.pathObj[key].samples;
    var length = samples.length;
    var sum = samples.reduce(reduceFunc);
    console.log(key + ': ' + (sum / length).toFixed(2) +
                '(' + length + ' hits)');
  }
};

Reporter.prototype.stop = function() {
  this.dumpAllBehaviors();
};

exports.Reporter = Reporter;
