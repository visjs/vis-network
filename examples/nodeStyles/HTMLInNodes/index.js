/* global vis */

var nodes = null
var edges = null

var svg =
  '<svg xmlns="http://www.w3.org/2000/svg" width="390" height="65">' +
  '<rect x="0" y="0" width="100%" height="100%" fill="#7890A7" stroke-width="20" stroke="#ffffff" ></rect>' +
  '<foreignObject x="15" y="10" width="100%" height="100%">' +
  '<div xmlns="http://www.w3.org/1999/xhtml" style="font-size:40px">' +
  ' <em>I</em> am' +
  '<span style="color:white; text-shadow:0 0 20px #000000;">' +
  ' HTML in SVG!</span>' +
  '</div>' +
  '</foreignObject>' +
  '</svg>'

var url = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg)

// Called when the Visualization API is loaded.
/* eslint-disable */
function draw() {
  /* eslint-enable */
  // Create a data table with nodes.
  nodes = []

  // Create a data table with links.
  edges = []

  nodes.push({ id: 1, label: 'Get HTML', image: url, shape: 'image' })
  nodes.push({ id: 2, label: 'Using SVG', image: url, shape: 'image' })
  edges.push({ from: 1, to: 2, length: 300 })

  // create a network
  var container = document.getElementById('mynetwork')
  var data = {
    nodes: nodes,
    edges: edges
  }
  var options = {
    physics: { stabilization: false },
    edges: { smooth: false }
  }
  new vis.Network(container, data, options)
}
