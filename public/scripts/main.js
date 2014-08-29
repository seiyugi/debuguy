var exampleSocket = new WebSocket('ws://127.0.0.1:8080');

var execGraph = new ExecutionGraph();

var logList = document.querySelector('#log-list');

var liTemplate = document.createElement('li');
liTemplate.setAttribute('class', 'log-item');

var timeTemplate = document.createElement('div');
timeTemplate.setAttribute('class', 'log-time');

var tagTemplate = document.createElement('div');
tagTemplate.setAttribute('class', 'log-tag');

exampleSocket.onopen = function(event) {
  console.log('websocket connection open!');
  exampleSocket.send('websocket connection open!');
};

exampleSocket.onmessage = function(event) {
  var data = JSON.parse(event.data);
  execGraph.insertNode(data);

  var logItem = liTemplate.cloneNode();
  var timeItem = timeTemplate.cloneNode();
  timeItem.innerHTML = moment(parseInt(data.time)).format('HH:mm:ss:SSS');
  var tagItem = tagTemplate.cloneNode();
  tagItem.innerHTML = data.path.join('.');
  logItem.appendChild(timeItem);
  logItem.appendChild(tagItem);
  logList.appendChild(logItem);

  console.log(data);
};
