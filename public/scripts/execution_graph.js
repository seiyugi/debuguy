var ExecutionGraph = function() {
  this.init();
};

ExecutionGraph.prototype.init = function() {
  this.nodes = [];
  this.links = [];
  this.source = {};

  var width = 960;
  var height = 600;
  var self = this;

  this.svg = d3.select('#demo').append('svg')
            .attr('width', width)
            .attr('height', height);

  // build the arrow.
  this.svg.append('svg:defs').selectAll('marker')
            .data(['end'])              // define different link/path types
          .enter().append('svg:marker') // adds the arrows
            .attr('id', String)
            .attr('viewBox', '0 -5 10 10')
            .attr('refX', 20)
            .attr("refY", -1.5)
            .attr('markerWidth', 6)
            .attr('markerHeight', 6)
            .attr('orient', 'auto')
          .append('svg:path')
            .attr('d', 'M0,-5L10,0L0,5');

  this.force = d3.layout.force()
              .nodes(this.nodes)
              .links(this.links)
              .charge(-400)
              .linkDistance(200)
              .size([width, height])
              .on('tick', tick);

  this.nodeDrag = d3.behavior.drag()
                  .on('dragstart', dragStart)
                  .on('drag', dragMove)
                  .on('dragend', dragStop);

  function tick() {
    var node = self.svg.selectAll('.node');
    var link = self.svg.selectAll('.link');

    node.attr('transform', function(d) {
      return 'translate(' + d.x + ',' + d.y + ')'
    });

    link.attr('d', function(d) {
      var dx = d.target.x - d.source.x;
      var dy = d.target.y - d.source.y;
      var dr = Math.sqrt(dx * dx + dy * dy);
      return 'M' + d.source.x + ',' + d.source.y +
        'A' + dr + ',' + dr + ' 0 0,1 ' + d.target.x + ',' + d.target.y;
    });
  }

  function dragStart(d, i) {
    self.force.stop();
  }

  function dragMove(d, i) {
    d.px += d3.event.dx;
    d.py += d3.event.dy;
    d.x += d3.event.dx;
    d.y += d3.event.dy;
    tick();
  }

  function dragStop(d, i) {
    d.fixed = true;
    tick();
    self.force.resume();
  }
};

ExecutionGraph.prototype.insertNode = function(data) {
  var self = this;

  function pathToString(path) {
    return path.join('-');
  }

  function findNode(path) {
    for (var i in self.nodes) {
      if (self.nodes[i].id === path) return i;
    }
  }

  function addNode(path) {
    var node;
    var nodeIndex = findNode(path);
    if (nodeIndex) {
      node = self.nodes[nodeIndex];
    } else {
      node = {id: path};
      self.nodes.push(node);
    }
    return node;
  }

  var path = pathToString(data.path);
  var node = addNode(path);

  if (this.source.node) {
    var link = {
      source: this.source.node,
      target: node
    };
    this.links.push(link);
    this.updateGraph();
  }
  this.source.node = node;
  this.source.path = path;
};

ExecutionGraph.prototype.updateGraph = function() {
  var link = this.svg.selectAll('.link');
  link = link.data(this.force.links());
  link.enter().insert('path', '.node')
      .attr('class', 'link')
      .attr('marker-end', 'url(#end)');
  link.exit().remove();

  var node = this.svg.selectAll('.node');
  node = node.data(this.force.nodes());

  var group = node.enter().append('g').attr('class', 'node');
  group.append('circle')
      .attr('class', function(d) { return d.id; })
      .attr('r', 8)
      .call(this.nodeDrag);
  group.append('text')
      .attr('x', '15px')
      .attr('y', '10px')
      .text(function(d) { return d.id; });
  node.exit().remove();

  this.force.start();
};