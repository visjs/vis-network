/* global vis nodes edges */

// eslint-disable-next-line require-jsdoc
function redrawAll() {
  // remove positoins
  for (var i = 0; i < nodes.length; i++) {
    delete nodes[i].x
    delete nodes[i].y
  }

  // create a network
  var container = document.getElementById('mynetwork')
  var data = {
    nodes: nodes,
    edges: edges
  }
  var options = {
    nodes: {
      shape: 'dot',
      scaling: {
        min: 10,
        max: 30
      },
      font: {
        size: 12,
        face: 'Tahoma'
      }
    },
    edges: {
      width: 0.15,
      color: { inherit: 'from' },
      smooth: {
        type: 'continuous'
      }
    },
    physics: {
      stabilization: false,
      barnesHut: {
        gravitationalConstant: -80000,
        springConstant: 0.001,
        springLength: 200
      }
    },
    interaction: {
      tooltipDelay: 200,
      hideEdgesOnDrag: true
    }
  }

  // Note: data is coming from ./datasources/WorldCup2014.js
  new vis.Network(container, data, options)
}

redrawAll()
