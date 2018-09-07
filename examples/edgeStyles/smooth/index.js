/* global vis */
// create an array with nodes
var nodes = [
  { id: 1, label: 'Fixed node', x: 0, y: 0, fixed: true },
  { id: 2, label: 'Drag me', x: 150, y: 130, physics: false },
  { id: 3, label: 'Obstacle', x: 80, y: -80, fixed: true, mass: 10 }
]

// create an array with edges
var edges = [{ from: 1, to: 2, arrows: 'to' }]

// create a network
var container = document.getElementById('mynetwork')
var data = {
  nodes: nodes,
  edges: edges
}
var options = {
  physics: true,
  configure: function(option, path) {
    if (path.indexOf('smooth') !== -1 || option === 'smooth') {
      return true
    }
    return false
  },
  edges: {
    smooth: {
      type: 'continuous'
    }
  }
}
new vis.Network(container, data, options)
