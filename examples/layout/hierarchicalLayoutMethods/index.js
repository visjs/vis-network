/* global vis */
var network = null
var layoutMethod = 'directed'

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

  var nodes = []
  var edges = []
  // randomly create some nodes and edges
  for (var i = 0; i < 19; i++) {
    nodes.push({ id: i, label: String(i) })
  }
  edges.push({ from: 0, to: 1 })
  edges.push({ from: 0, to: 6 })
  edges.push({ from: 0, to: 13 })
  edges.push({ from: 0, to: 11 })
  edges.push({ from: 1, to: 2 })
  edges.push({ from: 2, to: 3 })
  edges.push({ from: 2, to: 4 })
  edges.push({ from: 3, to: 5 })
  edges.push({ from: 1, to: 10 })
  edges.push({ from: 1, to: 7 })
  edges.push({ from: 2, to: 8 })
  edges.push({ from: 2, to: 9 })
  edges.push({ from: 3, to: 14 })
  edges.push({ from: 1, to: 12 })
  edges.push({ from: 16, to: 15 })
  edges.push({ from: 15, to: 17 })
  edges.push({ from: 18, to: 17 })

  // create a network
  var container = document.getElementById('mynetwork')
  var data = {
    nodes: nodes,
    edges: edges
  }

  var options = {
    layout: {
      hierarchical: {
        sortMethod: layoutMethod
      }
    },
    edges: {
      smooth: true,
      arrows: { to: true }
    }
  }
  new vis.Network(container, data, options)
}
