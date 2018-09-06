/* global vis */

document.getElementById('easingFunction').selectedIndex = 0

// eslint-disable-next-line require-jsdoc
function createNetwork(easingType) {
  var nodes = new vis.DataSet([
    { id: 1, label: 'Node 1' },
    { id: 2, label: 'Node 2' },
    { id: 3, label: 'Node 3' },
    { id: 4, label: 'Node 4' },
    { id: 5, label: 'Node 5' }
  ])

  var edges = new vis.DataSet([
    { from: 1, to: 3 },
    { from: 1, to: 2 },
    { from: 2, to: 4 },
    { from: 2, to: 5 }
  ])

  var container = document.getElementById('mynetwork')
  var data = {
    nodes: nodes,
    edges: edges
  }
  var options = {}
  var network = new vis.Network(container, data, options)
  network.once('beforeDrawing', function() {
    network.focus(2, {
      scale: 12
    })
  })
  network.once('afterDrawing', function() {
    network.fit({
      animation: {
        duration: 3000,
        easingFunction: easingType
      }
    })
  })
}
createNetwork('linear')
