/* global vis */
// create an array with nodes
var nodes = [
  { id: 1, label: 'Node 1', font: '12px arial red' },
  { id: 2, label: 'Node 2', font: { size: 12, color: 'lime', face: 'arial' } },
  { id: 3, label: 'Node 3', font: '18px verdana blue' },
  {
    id: 4,
    label: 'Node 4',
    font: { size: 12, color: 'red', face: 'sans', background: 'white' }
  },
  {
    id: 5,
    label: 'Node 5',
    font: {
      size: 15,
      color: 'red',
      face: 'courier',
      strokeWidth: 3,
      strokeColor: '#ffffff'
    }
  }
]

// create an array with edges
var edges = [
  { from: 1, to: 2 },
  { from: 1, to: 3 },
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
