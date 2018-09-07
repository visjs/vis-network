/* global vis */
// create an array with nodes
var nodes = new vis.DataSet([
  { id: 1, label: 'Node 1' },
  { id: 2, label: 'Node 2' },
  { id: 3, label: 'Node 3' },
  { id: 4, label: 'Node 4' },
  { id: 5, label: 'Node 5' }
])

// create an array with edges
var edges = new vis.DataSet([
  { from: 1, to: 3 },
  { from: 1, to: 2 },
  { from: 2, to: 4 },
  { from: 2, to: 5 }
])

// create a network
var container = document.getElementById('mynetwork')
var data = {
  nodes: nodes,
  edges: edges
}
var options = {}
const network = new vis.Network(container, data, options)

network.on('startStabilizing', function() {
  document.getElementById('eventSpan').innerHTML =
    '<h3>Starting Stabilization</h3>'
  console.log('started')
})
network.on('stabilizationProgress', function(params) {
  document.getElementById('eventSpan').innerHTML =
    '<h3>Stabilization progress</h3>' + JSON.stringify(params, null, 4)
  console.log('progress:', params)
})
network.on('stabilizationIterationsDone', function() {
  document.getElementById('eventSpan').innerHTML =
    '<h3>Stabilization iterations complete</h3>'
  console.log('finished stabilization interations')
})
network.on('stabilized', function(params) {
  document.getElementById('eventSpan').innerHTML =
    '<h3>Stabilized!</h3>' + JSON.stringify(params, null, 4)
  console.log('stabilized!', params)
})
