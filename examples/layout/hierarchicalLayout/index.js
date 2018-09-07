/* global vis getScaleFreeNetwork */
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
  // randomly create some nodes and edges
  var nodeCount = document.getElementById('nodeCount').value
  var data = getScaleFreeNetwork(nodeCount)

  // create a network
  var container = document.getElementById('mynetwork')
  var directionInput = document.getElementById('direction').value
  var options = {
    layout: {
      hierarchical: {
        direction: directionInput
      }
    }
  }
  new vis.Network(container, data, options)

  // add event listeners
  network.on('select', function(params) {
    document.getElementById('selection').innerHTML =
      'Selection: ' + params.nodes
  })
}
