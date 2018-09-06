/* global vis getScaleFreeNetwork */

var network = null

/* eslint-disable */
function draw() {
  /* eslint-enable */
  // randomly create some nodes and edges
  var data = getScaleFreeNetwork(25)

  // create a network
  var container = document.getElementById('mynetwork')

  var options = {
    physics: {
      stabilization: false
    },
    configure: true
  }
  network = new vis.Network(container, data, options)

  network.on('configChange', function() {
    // this will immediately fix the height of the configuration
    // wrapper to prevent unecessary scrolls in chrome.
    // see https://github.com/almende/vis/issues/1568
    var div = container.getElementsByClassName('vis-configuration-wrapper')[0]
    div.style['height'] = div.getBoundingClientRect().height + 'px'
  })
}
