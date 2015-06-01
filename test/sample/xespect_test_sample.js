(function() {
  var a = function() {};
  a.b = function() {};
  a.b.c = function() {
    function d() {
      function e() {
        setTimeout(function f() {}, 100);
      }
      e();
    }
    d();
  };
  a();
  a.b();
  a.b.c();
})();
