/* global vis getScaleFreeNetwork */
var network
var container
var exportArea

// eslint-disable-next-line require-jsdoc
function init() {
  container = document.getElementById('network')
  exportArea = document.getElementById('input_output')
  draw()
}

// eslint-disable-next-line require-jsdoc
function addConnections(elem, index) {
  // need to replace this with a tree of the network, then get child direct children of the element
  elem.connections = network.getConnectedNodes(index)
}

/* eslint-disable */
function destroyNetwork() {
  /* eslint-enable */
  network.destroy()
}

// eslint-disable-next-line require-jsdoc
function clearOutputArea() {
  exportArea.value = ''
}

// eslint-disable-next-line require-jsdoc
function draw() {
  // create a network of nodes
  var data = getScaleFreeNetwork(5)

  network = new vis.Network(container, data, {
    manipulation: { enabled: true }
  })

  clearOutputArea()
}

/* eslint-disable */
function exportNetwork() {
  /* eslint-enable */
  clearOutputArea()

  var nodes = objectToArray(network.getPositions())

  nodes.forEach(addConnections)

  // pretty print node data
  var exportValue = JSON.stringify(nodes, undefined, 2)

  exportArea.value = exportValue

  resizeExportArea()
}

/* eslint-disable */
function importNetwork() {
  /* eslint-enable */
  var inputValue = exportArea.value
  var inputData = JSON.parse(inputValue)

  var data = {
    nodes: getNodeData(inputData),
    edges: getEdgeData(inputData)
  }

  network = new vis.Network(container, data, {})

  resizeExportArea()
}

// eslint-disable-next-line require-jsdoc
function getNodeData(data) {
  var networkNodes = []

  data.forEach(function(elem) {
    networkNodes.push({ id: elem.id, label: elem.id, x: elem.x, y: elem.y })
  })

  return new vis.DataSet(networkNodes)
}

// eslint-disable-next-line require-jsdoc
function getNodeById(data, id) {
  for (var n = 0; n < data.length; n++) {
    if (data[n].id == id) {
      // double equals since id can be numeric or string
      return data[n]
    }
  }

  throw "Can not find id '" + id + "' in data"
}

// eslint-disable-next-line require-jsdoc
function getEdgeData(data) {
  var networkEdges = []

  data.forEach(function(node) {
    // add the connection
    node.connections.forEach(function(connId) {
      networkEdges.push({ from: node.id, to: connId })
      let cNode = getNodeById(data, connId)

      var elementConnections = cNode.connections

      // remove the connection from the other node to prevent duplicate connections
      var duplicateIndex = elementConnections.findIndex(function(connection) {
        return connection == node.id // double equals since id can be numeric or string
      })

      if (duplicateIndex != -1) {
        elementConnections.splice(duplicateIndex, 1)
      }
    })
  })

  return new vis.DataSet(networkEdges)
}

// eslint-disable-next-line require-jsdoc
function objectToArray(obj) {
  return Object.keys(obj).map(function(key) {
    obj[key].id = key
    return obj[key]
  })
}

// eslint-disable-next-line require-jsdoc
function resizeExportArea() {
  exportArea.style.height = 1 + exportArea.scrollHeight + 'px'
}

init()
