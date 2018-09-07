/* global vis */
// create an array with nodes
var nodes = new vis.DataSet([
  { id: 1, label: 'Node 1' },
  { id: 2, label: 'Node 2' },
  { id: 3, label: 'Node 3' },
  { id: 4, label: 'Node 4' },
  { id: 5, label: 'Node 5' }
])

// create an array with edges
var edges = new vis.DataSet([
  { from: 1, to: 3 },
  { from: 1, to: 2 },
  { from: 2, to: 4 },
  { from: 2, to: 5 }
])

// create a network
var container = document.getElementById('mynetwork')
var data = {
  nodes: nodes,
  edges: edges
}
var options = {}
const network = new vis.Network(container, data, options)

network.on('initRedraw', function() {
  // do something like move some custom elements?
})
network.on('beforeDrawing', function(ctx) {
  var nodeId = 1
  var nodePosition = network.getPositions([nodeId])
  ctx.strokeStyle = '#A6D5F7'
  ctx.fillStyle = '#294475'
  ctx.circle(nodePosition[nodeId].x, nodePosition[nodeId].y, 50)
  ctx.fill()
  ctx.stroke()
})
network.on('afterDrawing', function(ctx) {
  var nodeId = 1
  var nodePosition = network.getPositions([nodeId])
  ctx.strokeStyle = '#294475'
  ctx.lineWidth = 4
  ctx.fillStyle = '#A6D5F7'
  ctx.circle(nodePosition[nodeId].x, nodePosition[nodeId].y, 20)
  ctx.fill()
  ctx.stroke()
})
