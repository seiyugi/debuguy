var CodeFlowGraph = function(container) {
  var self = this;

  this.nodes = [];
  this.objects = [];
  this.functions = [];
  this.links = [];

  this.container = container;

  // create svg element
  this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  this.svg.setAttribute('width', container.clientWidth);
  this.svg.setAttribute('height', container.clientHeight);
  this.functionsContainer = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  this.functionsContainer.setAttribute('transform', 'translate(10)');
  this.objectsContainer = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  this.objectsContainer.setAttribute('transform', 'translate(10)');

  this.svg.appendChild(this.functionsContainer);
  this.svg.appendChild(this.objectsContainer);
  container.appendChild(this.svg);

  // var svgRect = self.svg.getBoundingClientRect();
  // var objRect = self.objectsContainer.getBoundingClientRect();
  this.funcRect = null;
  this.scrolling = false;
  this.scrollingStartTime = null;
  this.scrollTop = 0;
  this.originalScrollTop = 0;
  this.scrollLeft = 10;
  this.originalScrollLeft = 10;

  container.addEventListener('wheel', this);

  this.animationRequest = null;
  var lastFrameTime = Date.now();
  function render(timestamp) {
    var delta = timestamp - lastFrameTime;
    lastFrameTime = timestamp;

    if (self.scrolling) {
      // do nothing while scrolling
      if (Date.now() - self.scrollingStartTime > 300) {
        self.scrolling = false;
      }
    } else {
      // snap to the edge
      if (self.scrollTop > 0) {
        self.originalScrollTop = self.scrollTop;
        self.scrollTop -= delta;
        self.scrollTop = self.scrollTop > 0 ? self.scrollTop : 0;
      } else if (self.funcRect &&
                 self.funcRect.height > container.clientHeight &&
                 self.funcRect.height + self.scrollTop + 50 < container.clientHeight) {
        self.originalScrollTop = self.scrollTop;
        self.scrollTop += delta;
        self.scrollTop = self.funcRect.height + self.scrollTop + 50 < container.clientHeight ?
                         self.scrollTop : container.clientHeight - self.funcRect.height - 50;
      }

      if (self.scrollLeft > 10) {
        self.originalScrollLeft = self.scrollLeft;
        self.scrollLeft -= delta;
        self.scrollLeft = self.scrollLeft > 10 ? self.scrollLeft : 10;
      } else if (self.funcRect &&
                 self.funcRect.height > container.clientHeight &&
                 self.funcRect.height + self.scrollLeft - 200 < container.clientHeight) {
        self.originalScrollLeft = self.scrollLeft;
        self.scrollLeft += delta;
        self.scrollLeft = self.funcRect.height + self.scrollLeft - 200 < container.clientHeight ?
                          self.scrollLeft : container.clientHeight - self.funcRect.height + 200;
      }
    }

    if (self.scrollTop !== self.originalScrollTop || self.scrollLeft !== self.originalScrollLeft) {
      self.objectsContainer.transform.baseVal.getItem(0).setTranslate(self.scrollLeft, 0);
      self.functionsContainer.transform.baseVal.getItem(0).setTranslate(self.scrollLeft, self.scrollTop);
    }

    self.animationRequest = requestAnimationFrame(render);
  }

  this.animationRequest = requestAnimationFrame(render);
};

/**
 * Insert a node. Parse the node and call insertObject and insertFunction accordingly.
 * @param  {[type]} data [description]
 * @return {[type]}      [description]
 */
CodeFlowGraph.prototype.insertNode = function CodeFlowGraph_insertNode (data) {
  if (!data) {
    return;
  }

  var node = JSON.parse(data);
  this.nodes.push(node);

  var functionName = node.path.pop();
  var objectName = node.path.length > 0 ? node.path.join('.') : 'unknown';

  if (this.objects.indexOf(objectName) === -1) {
    this.objects.push(objectName);
    this.insertObject(objectName, this.objects.length - 1);
  }

  var funcNode = {
    objectName: objectName,
    functionName: functionName,
    cx: 50 + this.objects.indexOf(objectName) * 110,
    cy: 45 + this.functions.length * 30
  };

  this.functions.push(funcNode);
  this.insertFunction(funcNode);

  if (this.functions.length > 1) {
    var link = {
      source: { x: this.functions[this.functions.length - 2].cx, y: this.functions[this.functions.length - 2].cy},
      target: { x: this.functions[this.functions.length - 1].cx, y: this.functions[this.functions.length - 1].cy}
    };

    this.links.push(link);
    this.insertLink(link);
  }
};

/**
 * Insert a rectangle representing a javascript object
 * @param  {[type]} objNode {name: objectName, index: objectIndex}
 * @return {[type]}      [description]
 */
CodeFlowGraph.prototype.insertObject = function CodeFlowGraph_insertObject (objNode, index) {
  // console.log('insertObject');

  // var objectContainter = document.createElementNS('http://www.w3.org/2000/svg','g');
  // objectContainter.setAttribute('transform', 'translate(' + (index * 110) + ', 10)');

  var rectangle = document.createElementNS('http://www.w3.org/2000/svg','rect');
  rectangle.setAttribute('transform', 'translate(' + (index * 110) + ', 10)');
  rectangle.setAttribute('width', 100);
  rectangle.setAttribute('height', 15);

  var text = document.createElementNS('http://www.w3.org/2000/svg','text');
  text.setAttribute('transform', 'translate(' + (index * 110) + ', 10)');
  text.setAttribute('dx', 5);
  text.setAttribute('dy', 10);
  var textNode = document.createTextNode(objNode);
  text.appendChild(textNode);

  this.objectsContainer.appendChild(rectangle);
  this.objectsContainer.appendChild(text);
  // this.objectsContainer.appendChild(objectContainter);
};

/**
 * Insert a ellipse representing a javascript function call
 * @param  {[type]} funcNode [description]
 * @return {[type]}      [description]
 */
CodeFlowGraph.prototype.insertFunction = function CodeFlowGraph_insertFunction (funcNode) {
  // console.log('insertFunction');

  // var functionContainter = document.createElementNS('http://www.w3.org/2000/svg','g');
  // functionContainter.setAttribute('transform', 'translate(' + funcNode.cx + ', ' + funcNode.cy + ')');

  var ellipse = document.createElementNS('http://www.w3.org/2000/svg','ellipse');
  ellipse.setAttribute('transform', 'translate(' + funcNode.cx + ', ' + funcNode.cy + ')');
  ellipse.setAttribute('rx', 60);
  ellipse.setAttribute('ry', 10);

  var text = document.createElementNS('http://www.w3.org/2000/svg','text');
  text.setAttribute('transform', 'translate(' + funcNode.cx + ', ' + funcNode.cy + ')');
  text.setAttribute('text-anchor', 'middle');
  text.setAttribute('dy', 3);
  var textNode = document.createTextNode(funcNode.functionName);
  text.appendChild(textNode);

  this.functionsContainer.appendChild(ellipse);
  this.functionsContainer.appendChild(text);

  // this.functionsContainer.appendChild(functionContainter);
};

/**
 * Insert a link with arrow representing the code flow.
 * @param  {[type]} linkNode [description]
 * @return {[type]}      [description]
 */
CodeFlowGraph.prototype.insertLink = function CodeFlowGraph_insertLink (linkNode) {
  // console.log('insertLink');

  var line = document.createElementNS('http://www.w3.org/2000/svg','line');
  line.setAttribute('x1', linkNode.source.x);
  line.setAttribute('x2', linkNode.target.x);
  line.setAttribute('y1', linkNode.source.y);
  line.setAttribute('y2', linkNode.target.y);
  this.functionsContainer.insertBefore(line, this.functionsContainer.querySelector('ellipse'));
};

/**
 * Filter the graph
 */
CodeFlowGraph.prototype.filter = function CodeFlowGraph_filter (options) {

};

/**
 * Update the graph
 */
CodeFlowGraph.prototype.update = function CodeFlowGraph_update () {

};

/**
 * Handle wheel event
 */
CodeFlowGraph.prototype.handleEvent = function CodeFlowGraph_handleEvent (e) {
  this.scrolling = true;
  this.scrollingStartTime = Date.now();
  this.funcRect = this.functionsContainer.getBoundingClientRect();

  if (this.funcRect.height > this.container.clientHeight) {
    this.originalScrollTop = this.scrollTop;
    this.scrollTop -= e.deltaY * 2;
  }

  if (this.funcRect.width > this.container.clientWidth) {
    this.originalScrollLeft = this.scrollLeft;
    this.scrollLeft -= e.deltaX * 2;
  }
};

/**
 * Clear the graph
 */
CodeFlowGraph.prototype.clear = function CodeFlowGraph_clear () {
  cancelAnimationFrame(this.animationRequest);
  this.container.removeEventListener('wheel', this);
  this.container.removeChild(this.svg);
};
