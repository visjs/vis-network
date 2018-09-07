/* global vis */
// create an array with nodes
var nodes = [
  { id: 1, label: 'Default Value\n(5)', x: -150, y: -150 },
  { id: 2, label: 'Single Value\n(25)', margin: 20, x: 0, y: 0 },
  {
    id: 3,
    label: 'Different Values\n(10, 20, 40, 30)',
    margin: { top: 10, right: 20, bottom: 40, left: 30 },
    x: 120,
    y: 120
  },
  {
    id: 4,
    label: 'A Negative Value\n(10, 20, 40, -50)',
    margin: { top: 10, right: 20, bottom: 30, left: -20 },
    x: 300,
    y: -300
  }
]

// create an array with edges
var edges = [{ from: 1, to: 2 }, { from: 2, to: 3 }, { from: 3, to: 4 }]

// create a network
var container = document.getElementById('mynetwork')
var data = {
  nodes: nodes,
  edges: edges
}
var options = {
  nodes: {
    shape: 'box'
  }
}
new vis.Network(container, data, options)
