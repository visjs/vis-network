/* global vis */
var nodeIds, shadowState, nodesArray, nodes, edgesArray, edges, network

// eslint-disable-next-line require-jsdoc
function startNetwork() {
  // this list is kept to remove a random node.. we do not add node 1 here because it's used for changes
  nodeIds = [2, 3, 4, 5]
  shadowState = false

  // create an array with nodes
  nodesArray = [
    { id: 1, label: 'Node 1' },
    { id: 2, label: 'Node 2' },
    { id: 3, label: 'Node 3' },
    { id: 4, label: 'Node 4' },
    { id: 5, label: 'Node 5' }
  ]
  nodes = new vis.DataSet(nodesArray)

  // create an array with edges
  edgesArray = [
    { from: 1, to: 3 },
    { from: 1, to: 2 },
    { from: 2, to: 4 },
    { from: 2, to: 5 }
  ]
  edges = new vis.DataSet(edgesArray)

  // create a network
  var container = document.getElementById('mynetwork')
  var data = {
    nodes: nodes,
    edges: edges
  }
  var options = {}
  new vis.Network(container, data, options)
}

/* eslint-disable */
function addNode() {
  /* eslint-enable */
  var newId = (Math.random() * 1e7).toString(32)
  nodes.add({ id: newId, label: "I'm new!" })
  nodeIds.push(newId)
}

/* eslint-disable */
function changeNode1() {
  /* eslint-enable */
  var newColor = '#' + Math.floor(Math.random() * 255 * 255 * 255).toString(16)
  nodes.update([{ id: 1, color: { background: newColor } }])
}

/* eslint-disable */
function removeRandomNode() {
  /* eslint-enable */
  var randomNodeId = nodeIds[Math.floor(Math.random() * nodeIds.length)]
  nodes.remove({ id: randomNodeId })

  var index = nodeIds.indexOf(randomNodeId)
  nodeIds.splice(index, 1)
}

/* eslint-disable */
function changeOptions() {
  /* eslint-enable */
  shadowState = !shadowState
  network.setOptions({
    nodes: { shadow: shadowState },
    edges: { shadow: shadowState }
  })
}

// eslint-disable-next-line require-jsdoc
function resetAllNodes() {
  nodes.clear()
  edges.clear()
  nodes.add(nodesArray)
  edges.add(edgesArray)
}

/* eslint-disable */
function resetAllNodesStabilize() {
  /* eslint-enable */
  resetAllNodes()
  network.stabilize()
}

/* eslint-disable */
function setTheData() {
  /* eslint-enable */
  nodes = new vis.DataSet(nodesArray)
  edges = new vis.DataSet(edgesArray)
  network.setData({ nodes: nodes, edges: edges })
}

/* eslint-disable */
function resetAll() {
  /* eslint-enable */
  if (network !== null) {
    network.destroy()
    network = null
  }
  startNetwork()
}

startNetwork()
