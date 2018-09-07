/* global vis getScaleFreeNetwork */
var network = null
var setSmooth = false

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
  var nodeCount = document.getElementById('nodeCount').value
  if (nodeCount > 100) {
    document.getElementById('message').innerHTML =
      '<a onclick="disableSmoothCurves()">You may want to disable dynamic smooth curves for better performance with a large amount of nodes and edges. Click here to disable them.</a>'
  } else if (setSmooth === false) {
    document.getElementById('message').innerHTML = ''
  }
  // create a network
  var container = document.getElementById('mynetwork')
  var data = getScaleFreeNetwork(nodeCount)
  var options = {
    physics: { stabilization: false }
  }
  network = new vis.Network(container, data, options)
}

/* eslint-disable */
function disableSmoothCurves() {
  /* eslint-enable */
  setSmooth = true
  network.setOptions({ edges: { smooth: { type: 'continuous' } } })
  document.getElementById('message').innerHTML =
    '<a onclick="enableSmoothCurves()">Click here to reenable the dynamic smooth curves.</a>'
}

/* eslint-disable */
function enableSmoothCurves() {
  /* eslint-enable */
  setSmooth = false
  document.getElementById('message').innerHTML =
    '<a onclick="disableSmoothCurves()">You may want to disable dynamic smooth curves for better performance with a large amount of nodes and edges. Click here to disable them.</a>'
  network.setOptions({ edges: { smooth: { type: 'dynamic' } } })
}
