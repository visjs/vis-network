/* global vis */
// create an array with nodes
var nodes = [
  { id: 1, label: 'Node 1', font: { strokeWidth: 3, strokeColor: 'white' } },
  { id: 2, label: 'Node 2' },
  { id: 3, label: 'Node 3' },
  { id: 4, label: 'Node 4' },
  { id: 5, label: 'Node 5' }
]

// create an array with edges
var edges = [
  {
    from: 1,
    to: 2,
    label: 'edgeLabel',
    font: { strokeWidth: 2, strokeColor: '#00ff00' }
  },
  { from: 1, to: 3, label: 'edgeLabel' },
  { from: 2, to: 4 },
  { from: 2, to: 5 }
]

// create a network
var container = document.getElementById('mynetwork')
var data = {
  nodes: nodes,
  edges: edges
}
var options = {
  nodes: {
    shape: 'dot',
    size: 10
  }
}
new vis.Network(container, data, options)
