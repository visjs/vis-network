/* global vis */
var nodes, edges

// convenience method to stringify a JSON object
/* eslint-disable */
function toJSON(obj) {
  /* eslint-enable */
  return JSON.stringify(obj, null, 4)
}

/* eslint-disable */
function addNode() {
  /* eslint-enable */
  try {
    nodes.add({
      id: document.getElementById('node-id').value,
      label: document.getElementById('node-label').value
    })
  } catch (err) {
    alert(err)
  }
}

/* eslint-disable */
function updateNode() {
  /* eslint-enable */
  try {
    nodes.update({
      id: document.getElementById('node-id').value,
      label: document.getElementById('node-label').value
    })
  } catch (err) {
    alert(err)
  }
}

/* eslint-disable */
function removeNode() {
  /* eslint-enable */
  try {
    nodes.remove({ id: document.getElementById('node-id').value })
  } catch (err) {
    alert(err)
  }
}

/* eslint-disable */
function addEdge() {
  /* eslint-enable */
  try {
    edges.add({
      id: document.getElementById('edge-id').value,
      from: document.getElementById('edge-from').value,
      to: document.getElementById('edge-to').value
    })
  } catch (err) {
    alert(err)
  }
}

/* eslint-disable */
function updateEdge() {
  /* eslint-enable */
  try {
    edges.update({
      id: document.getElementById('edge-id').value,
      from: document.getElementById('edge-from').value,
      to: document.getElementById('edge-to').value
    })
  } catch (err) {
    alert(err)
  }
}

/* eslint-disable */
function removeEdge() {
  /* eslint-enable */
  try {
    edges.remove({ id: document.getElementById('edge-id').value })
  } catch (err) {
    alert(err)
  }
}

/* eslint-disable */
function draw() {
  /* eslint-enable */
  // create an array with nodes
  nodes = new vis.DataSet()
  nodes.on('*', function() {
    document.getElementById('nodes').innerHTML = JSON.stringify(
      nodes.get(),
      null,
      4
    )
  })
  nodes.add([
    { id: '1', label: 'Node 1' },
    { id: '2', label: 'Node 2' },
    { id: '3', label: 'Node 3' },
    { id: '4', label: 'Node 4' },
    { id: '5', label: 'Node 5' }
  ])

  // create an array with edges
  edges = new vis.DataSet()
  edges.on('*', function() {
    document.getElementById('edges').innerHTML = JSON.stringify(
      edges.get(),
      null,
      4
    )
  })
  edges.add([
    { id: '1', from: '1', to: '2' },
    { id: '2', from: '1', to: '3' },
    { id: '3', from: '2', to: '4' },
    { id: '4', from: '2', to: '5' }
  ])

  // create a network
  var container = document.getElementById('network')
  var data = {
    nodes: nodes,
    edges: edges
  }
  var options = {}
  new vis.Network(container, data, options)
}
