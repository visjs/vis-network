/* global vis */
// create an array with nodes
var nodes = [
  { id: 1, label: 'Node 1' },
  { id: 2, label: 'Node 2' },
  {
    id: 3,
    label: 'Node 3:\nLeft-Aligned',
    font: { face: 'Monospace', align: 'left' }
  },
  { id: 4, label: 'Node 4' },
  {
    id: 5,
    label: 'Node 5\nLeft-Aligned box',
    shape: 'box',
    font: { face: 'Monospace', align: 'left' }
  }
]

// create an array with edges
var edges = [
  { from: 1, to: 2, label: 'middle', font: { align: 'middle' } },
  { from: 1, to: 3, label: 'top', font: { align: 'top' } },
  { from: 2, to: 4, label: 'horizontal', font: { align: 'horizontal' } },
  { from: 2, to: 5, label: 'bottom', font: { align: 'bottom' } }
]

// create a network
var container = document.getElementById('mynetwork')
var data = {
  nodes: nodes,
  edges: edges
}
var options = { physics: false }
const network = new vis.Network(container, data, options)

network.on('click', function(params) {
  params.event = '[original event]'
  document.getElementById('eventSpan').innerHTML =
    '<h2>Click event:</h2>' + JSON.stringify(params, null, 4)
})
