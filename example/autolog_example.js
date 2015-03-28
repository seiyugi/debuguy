// this is the test file for debuguy autolog command
// add more test cases and move it to unit test after parser.js refactored in the future

try {
} catch (e) {
  setTimeout(function () {
    throw e;
  });
}

function a (param) {
  return param;
}

var b = function (param) {
  return param;
};

var c;

c = function (param) {
  return param;
};

var obj = {
  prop: 'prop',
  func: function (param) {
    return param;
  }
};

obj.c = function (param) {
  return param;
};

var d = 'd';

obj[d] = function (param) {
  return param;
};

obj['e'] = function (param) {
  return param;
};

setTimeout(function () {

});
