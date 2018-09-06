/* global vis */

// create an array with nodes
var nodes = new vis.DataSet([
  { id: 1, label: 'html color', color: 'lime' },
  { id: 2, label: 'rgb color', color: 'rgb(255,168,7)' },
  { id: 3, label: 'hex color', color: '#7BE141' },
  { id: 4, label: 'rgba color', color: 'rgba(97,195,238,0.5)' },
  {
    id: 5,
    label: 'colorObject',
    color: { background: 'pink', border: 'purple' }
  },
  {
    id: 6,
    label: 'colorObject + highlight',
    color: {
      background: '#F03967',
      border: '#713E7F',
      highlight: { background: 'red', border: 'black' }
    }
  },
  {
    id: 7,
    label: 'colorObject + highlight + hover',
    color: {
      background: 'cyan',
      border: 'blue',
      highlight: { background: 'red', border: 'blue' },
      hover: { background: 'white', border: 'red' }
    }
  }
])

// create an array with edges
var edges = new vis.DataSet([
  { from: 1, to: 3 },
  { from: 1, to: 2 },
  { from: 2, to: 4 },
  { from: 2, to: 5 },
  { from: 2, to: 6 },
  { from: 4, to: 7 }
])

// create a network
var container = document.getElementById('mynetwork')
var data = {
  nodes: nodes,
  edges: edges
}
var options = {
  nodes: { borderWidth: 2 },
  interaction: { hover: true }
}
new vis.Network(container, data, options)
