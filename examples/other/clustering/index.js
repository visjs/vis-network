/* global vis */

// create an array with nodes
var nodes = [
  { id: 1, label: 'Node 1', color: 'orange' },
  { id: 2, label: 'Node 2', color: 'DarkViolet', font: { color: 'white' } },
  { id: 3, label: 'Node 3', color: 'orange' },
  { id: 4, label: 'Node 4', color: 'DarkViolet', font: { color: 'white' } },
  { id: 5, label: 'Node 5', color: 'orange' },
  { id: 6, label: 'cid = 1', cid: 1, color: 'orange' },
  {
    id: 7,
    label: 'cid = 1',
    cid: 1,
    color: 'DarkViolet',
    font: { color: 'white' }
  },
  { id: 8, label: 'cid = 1', cid: 1, color: 'lime' },
  { id: 9, label: 'cid = 1', cid: 1, color: 'orange' },
  { id: 10, label: 'cid = 1', cid: 1, color: 'lime' }
]

// create an array with edges
var edges = [
  { from: 1, to: 2 },
  { from: 1, to: 3 },
  { from: 10, to: 4 },
  { from: 2, to: 5 },
  { from: 6, to: 2 },
  { from: 7, to: 5 },
  { from: 8, to: 6 },
  { from: 9, to: 7 },
  { from: 10, to: 9 }
]

// create a network
var container = document.getElementById('mynetwork')
var data = {
  nodes: nodes,
  edges: edges
}
var options = { layout: { randomSeed: 8 } }
var network = new vis.Network(container, data, options)
network.on('selectNode', function(params) {
  if (params.nodes.length == 1) {
    if (network.isCluster(params.nodes[0]) == true) {
      network.openCluster(params.nodes[0])
    }
  }
})

/* eslint-disable */
function clusterByCid() {
  /* eslint-enable */
  network.setData(data)
  var clusterOptionsByData = {
    joinCondition: function(childOptions) {
      return childOptions.cid == 1
    },
    clusterNodeProperties: {
      id: 'cidCluster',
      borderWidth: 3,
      shape: 'database'
    }
  }
  network.cluster(clusterOptionsByData)
}

/* eslint-disable */
function clusterByColor() {
  /* eslint-enable */
  network.setData(data)
  var colors = ['orange', 'lime', 'DarkViolet']
  var clusterOptionsByData
  for (var i = 0; i < colors.length; i++) {
    var color = colors[i]
    clusterOptionsByData = {
      joinCondition: function(childOptions) {
        return childOptions.color.background == color // the color is fully defined in the node.
      },
      processProperties: function(clusterOptions, childNodes) {
        var totalMass = 0
        for (var i = 0; i < childNodes.length; i++) {
          totalMass += childNodes[i].mass
        }
        clusterOptions.mass = totalMass
        return clusterOptions
      },
      clusterNodeProperties: {
        id: 'cluster:' + color,
        borderWidth: 3,
        shape: 'database',
        color: color,
        label: 'color:' + color
      }
    }
    network.cluster(clusterOptionsByData)
  }
}

/* eslint-disable */
function clusterByConnection() {
  /* eslint-enable */
  network.setData(data)
  network.clusterByConnection(1)
}

/* eslint-disable */
function clusterOutliers() {
  /* eslint-enable */
  network.setData(data)
  network.clusterOutliers()
}

/* eslint-disable */
function clusterByHubsize() {
  /* eslint-enable */
  network.setData(data)
  var clusterOptionsByData = {
    processProperties: function(clusterOptions, childNodes) {
      clusterOptions.label = '[' + childNodes.length + ']'
      return clusterOptions
    },
    clusterNodeProperties: { borderWidth: 3, shape: 'box', font: { size: 30 } }
  }
  network.clusterByHubsize(undefined, clusterOptionsByData)
}
