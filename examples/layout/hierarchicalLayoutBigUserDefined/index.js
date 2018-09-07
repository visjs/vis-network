/* global vis */

/* eslint-disable */
function p(data) {
  /* eslint-enable */

  var container = document.getElementById('mynetwork')
  var options = {
    layout: {
      hierarchical: {}
    }
  }
  console.log('starting layout')
  new vis.Network(container, data, options)
  console.log('layout complete')
}
