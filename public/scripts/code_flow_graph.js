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
  var funcRect;
  var scrolling = false;
  var scrollingStartTime;
  var scrollTop = 0;
  var originalScrollTop = 0;
  var scrollLeft = 10;
  var originalScrollLeft = 10;
  container.addEventListener('wheel', function (e) {
    scrolling = true;
    scrollingStartTime = Date.now();
    funcRect = self.functionsContainer.getBoundingClientRect();

    if (funcRect.height > container.clientHeight) {
      originalScrollTop = scrollTop;
      scrollTop -= e.deltaY * 2;
    }

    if (funcRect.width > container.clientWidth) {
      originalScrollLeft = scrollLeft;
      scrollLeft -= e.deltaX * 2;
    }
  });

  var lastFrameTime = Date.now();
  (function render() {
    var now = Date.now();
    var delta = now - lastFrameTime;
    lastFrameTime = now;

    if (scrolling) {
      // do nothing while scrolling
      if (Date.now() - scrollingStartTime > 300) {
        scrolling = false;
      }
    } else {
      // snap to the edge
      if (scrollTop > 0) {
        originalScrollTop = scrollTop;
        scrollTop -= delta;
        scrollTop = scrollTop > 0 ? scrollTop : 0;
      } else if (funcRect &&
                 funcRect.height > container.clientHeight &&
                 funcRect.height + scrollTop + 50 < container.clientHeight) {
        originalScrollTop = scrollTop;
        scrollTop += delta;
        scrollTop = funcRect.height + scrollTop + 50 < container.clientHeight ? scrollTop : container.clientHeight - funcRect.height - 50;
      }

      if (scrollLeft > 10) {
        originalScrollLeft = scrollLeft;
        scrollLeft -= delta;
        scrollLeft = scrollLeft > 10 ? scrollLeft : 10;
      } else if (funcRect &&
                 funcRect.height > container.clientHeight &&
                 funcRect.height + scrollLeft - 200 < container.clientHeight) {
        originalScrollLeft = scrollLeft;
        scrollLeft += delta;
        scrollLeft = funcRect.height + scrollLeft - 200 < container.clientHeight ? scrollLeft : container.clientHeight - funcRect.height + 200;
      }
    }

    if (scrollTop !== originalScrollTop || scrollLeft !== originalScrollLeft) {
      self.objectsContainer.transform.baseVal.getItem(0).setTranslate(scrollLeft, 0);
      self.functionsContainer.transform.baseVal.getItem(0).setTranslate(scrollLeft, scrollTop);
    }

    requestAnimationFrame(render);
  })();
};

/**
 * Insert a node. Parse the node and call insertObject and insertFunction accordingly.
 * @param  {[type]} node [description]
 * @return {[type]}      [description]
 */
CodeFlowGraph.prototype.insertNode = function CodeFlowGraph_insertNode (node) {
  if (!node) {
    return;
  }

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
 * Clear the graph
 */
CodeFlowGraph.prototype.clear = function CodeFlowGraph_clear () {

};
