/* global vis nodes edges */
var data = {
  nodes: nodes,
  edges: edges
}
// create a network
var container = document.getElementById('network')
var options = {
  layout: {
    hierarchical: {
      direction: 'UD',
      sortMethod: 'directed'
    }
  },
  interaction: { dragNodes: false },
  physics: {
    enabled: false
  },
  configure: {
    filter: function(option, path) {
      if (path.indexOf('hierarchical') !== -1) {
        return true
      }
      return false
    },
    showButton: false
  }
}
new vis.Network(container, data, options)
