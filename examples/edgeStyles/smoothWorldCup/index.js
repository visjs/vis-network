/* global vis nodes edges */

// eslint-disable-next-line require-jsdoc
function redrawAll() {
  var container = document.getElementById('mynetwork')
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
      color: { inherit: true },
      width: 0.15,
      smooth: {
        type: 'continuous'
      }
    },
    interaction: {
      hideEdgesOnDrag: true,
      tooltipDelay: 200
    },
    configure: {
      filter: function(option, path) {
        if (option === 'inherit') {
          return true
        }
        if (option === 'type' && path.indexOf('smooth') !== -1) {
          return true
        }
        if (option === 'roundness') {
          return true
        }
        if (option === 'hideEdgesOnDrag') {
          return true
        }
        if (option === 'hideNodesOnDrag') {
          return true
        }
        return false
      },
      container: document.getElementById('optionsContainer'),
      showButton: false
    },
    physics: false
  }

  var data = { nodes: nodes, edges: edges }
  // Note: data is coming from ./data/WorldCup2014.js
  new vis.Network(container, data, options)
}

redrawAll()
