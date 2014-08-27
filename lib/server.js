'use strict';

var IS_PRODUCTION = false;
var HTTP_DOC_PATH = './public';

var express = require('express'),
    // http = require('http'),
    app = express(),
    WebSocketServer = require('ws').Server;

var httpServer, wss;
var cache = [];

var server = {
  start: function _start() {

    var port = (IS_PRODUCTION ? 80 : 8000);

    // start web server
    // handling 404 errors
    app.use(function(err, req, res, next) {
      if(err.status !== 404) {
        return next();
      }

      res.send(err.message || '** no unicorns here **');

      console.log(err.message);
    });
    app.use(express.static(HTTP_DOC_PATH));
    httpServer = app.listen(port, function() {
      console.log('Listening on port %d', httpServer.address().port);
    });

    // start websocket server
    wss = new WebSocketServer({
      port: 8080
    });

    wss.on('connection', function(ws) {
      ws.on('message', function(message) {
        console.log('received: %s', message);
      });
      // ws.send('hi from websocket server');
      console.log('websocket connection established');

      if (cache) {
        cache.forEach(function(data) {
          ws.send(JSON.stringify(data));
          console.log('send: ', JSON.stringify(data));
        });
      }
    });

  },
  broadcast: function _broadcast(message) {
    cache.push(message);

    for(var i in wss.clients) {
      wss.clients[i].send(JSON.stringify(message));
    }

    console.log('broadcast: ' + JSON.stringify(message));
  }

};

module.exports = server;
