/* global vis */
var container = document.getElementById('mynetwork')
var dot = 'dinetwork {node[shape=circle]; 1 -> 1 -> 2; 2 -> 3; 2 -- 4; 2 -> 1 }'
var data = vis.network.convertDot(dot)
new vis.Network(container, data)
