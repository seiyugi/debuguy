var CallStackGraph = function(container) {
  var self = this;
  var mainContainer = document.createElement('div');
  mainContainer.id = 'mainContainer';
  container.appendChild(mainContainer);
  this.parentContainer = container;
  this.container = mainContainer;
  this.stack = [];
  this.currentNode = this.container;
};

/**
 * Insert a node. Parse the node and call insertObject and insertFunction accordingly.
 * @param  {[type]} node [description]
 * @return {[type]}      [description]
 */
CallStackGraph.prototype.insertNode = function CallStackGraph_insertNode (data) {
  var node = JSON.parse(data);
  if (node.type === 'ENTER') {
    this.stack.push(node);

    var newNode = document.createElement('div');
    newNode.style.backgroundColor = 'rgb(0,' + ',0)';
    newNode.id = ('ID' + node.time + node.path[0] + node.path[1]).replace('@', '');
    var newText = document.createElement('div');
    var funcNameSet = node.path[1].split('@');
    newText.innerHTML = '<span>' + node.path[0] + '</span>' +
      '.<span class="funcName">' + funcNameSet[0] + '</span>' +
      '<span>@' + funcNameSet[1] + '</span>' +
      '<span class="ts"></span>';
    newText.classList.add('nodeDesc');
    var newStack = document.createElement('div');
    newStack.classList.add('stack');
    newNode.appendChild(newText);
    newNode.appendChild(newStack);
    this.currentNode.appendChild(newNode);
    this.currentNode = newStack;
  } else if (node.type === 'LEAVE') {
    var popNode = this.stack.pop();
    if (popNode.time === node.time &&
      popNode.path[0] === node.path[0] &&
      popNode.path[1] === node.path[1]) {
      this.currentNode = this.currentNode.parentNode.parentNode;
      var nodeId = ('ID' + node.time + node.path[0] + node.path[1]).replace('@', '');
      var timeDiff = node.timeStamp - popNode.timeStamp;
      var startNode = document.querySelector('#' + nodeId + ' > .nodeDesc > .ts');
      startNode.textContent = timeDiff;
    }else {
      console.error('ERROR: path/time misfit!');
    }
  } else {
    console.error('ERROR: type missing/invalid!');
  }
};

CallStackGraph.prototype.clear = function CallStackGraph_clear () {
  this.parentContainer.removeChild(this.container);
};
