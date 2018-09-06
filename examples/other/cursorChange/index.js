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
var options = { interaction: { hover: true } }
var network = new vis.Network(container, data, options)

//Get the canvas HTML element
var networkCanvas = document
  .getElementById('mynetwork')
  .getElementsByTagName('canvas')[0]

// eslint-disable-next-line require-jsdoc
function changeCursor(newCursorStyle) {
  networkCanvas.style.cursor = newCursorStyle
}

/* eslint-disable */
function changeEventCursor(eventName, cursorType) {
  /* eslint-enable */
  network.on(eventName, function() {
    changeCursor(cursorType)
  })
}
network.on('hoverNode', function() {
  changeCursor('grab')
})
network.on('blurNode', function() {
  changeCursor('default')
})
network.on('hoverEdge', function() {
  changeCursor('grab')
})
network.on('blurEdge', function() {
  changeCursor('default')
})
network.on('dragStart', function() {
  changeCursor('grabbing')
})
network.on('dragging', function() {
  changeCursor('grabbing')
})
network.on('dragEnd', function() {
  changeCursor('grab')
})
