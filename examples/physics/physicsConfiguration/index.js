/* global vis getScaleFreeNetwork */

/* eslint-disable */
function draw() {
  /* eslint-enable */
  // randomly create some nodes and edges
  var data = getScaleFreeNetwork(60)
  console.log('data', data)

  // create a network
  var container = document.getElementById('mynetwork')

  var options = {
    physics: {
      stabilization: false
    },
    configure: {
      filter: function(option, path) {
        if (path.indexOf('physics') !== -1) {
          return true
        }
        if (path.indexOf('smooth') !== -1 || option === 'smooth') {
          return true
        }
        return false
      },
      container: document.getElementById('config')
    }
  }
  new vis.Network(container, data, options)
}
