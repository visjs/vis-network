/* global vis */

var container = document.getElementById('mynetwork')
var data = { nodes: nodes, edges: edges }
new vis.Network(container, data, options)
