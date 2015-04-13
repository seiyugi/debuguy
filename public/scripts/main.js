var exampleSocket = new WebSocket('ws://127.0.0.1:8080');

var graph = new CodeFlowGraph(document.getElementById('demo'));

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

var dataCache = [];

exampleSocket.onmessage = function(event) {
  dataCache.push(event.data);
  graph.insertNode(event.data);

  var data = JSON.parse(event.data);

  // if (data.path[data.path.length-1].startsWith('anonymous')) { return; }

  var logItem = liTemplate.cloneNode();
  var timeItem = timeTemplate.cloneNode();
  timeItem.innerHTML = moment(parseInt(data.time)).format('HH:mm:ss:SSS');
  var tagItem = tagTemplate.cloneNode();
  tagItem.innerHTML = data.path.join('.');
  logItem.appendChild(timeItem);
  logItem.appendChild(tagItem);
  logList.appendChild(logItem);
};

var graphChoices = document.getElementById('graph-choices');

graphChoices.addEventListener('change', function (e) {
  console.log('select ', e.target.value);
  graph.clear();

  switch (e.target.value) {
    case 'code-flow-graph':
      graph = new CodeFlowGraph(document.getElementById('demo'));
      break;
    case 'call-stack-graph':
      graph = new CallStackGraph(document.getElementById('demo'));
      break;
    case 'execution-graph':
      graph = new ExecutionGraph();
      break;
  }

  dataCache.forEach(function (data) {
    graph.insertNode(data);
  });
});
