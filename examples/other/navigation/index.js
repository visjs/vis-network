/* global vis */

var network = null

// eslint-disable-next-line require-jsdoc
function destroy() {
  if (network !== null) {
    network.destroy()
    network = null
  }
}

/* eslint-disable */
function draw() {
  /* eslint-enable */
  destroy()

  // create an array with nodes
  var nodes = [
    { id: 1, label: 'Node 1' },
    { id: 2, label: 'Node 2' },
    { id: 3, label: 'Node 3' },
    { id: 4, label: 'Node 4' },
    { id: 5, label: 'Node 5' }
  ]

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
  var options = {
    interaction: {
      navigationButtons: true,
      keyboard: true
    }
  }
  network = new vis.Network(container, data, options)

  // add event listeners
  network.on('select', function(params) {
    document.getElementById('selection').innerHTML =
      'Selection: ' + params.nodes
  })
}
