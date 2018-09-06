var nodes = null
var edges = null
var network = null
var setSmooth = false

function destroy() {
  if (network !== null) {
    network.destroy()
    network = null
  }
}

function draw() {
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

function disableSmoothCurves() {
  setSmooth = true
  network.setOptions({ edges: { smooth: { type: 'continuous' } } })
  document.getElementById('message').innerHTML =
    '<a onclick="enableSmoothCurves()">Click here to reenable the dynamic smooth curves.</a>'
}

function enableSmoothCurves() {
  setSmooth = false
  document.getElementById('message').innerHTML =
    '<a onclick="disableSmoothCurves()">You may want to disable dynamic smooth curves for better performance with a large amount of nodes and edges. Click here to disable them.</a>'
  network.setOptions({ edges: { smooth: { type: 'dynamic' } } })
}
