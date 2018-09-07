/* global vis */

/* eslint-disable */
function draw() {
  /* eslint-enable */
  let nodes = [
    {
      id: 1,
      font: { size: 30 },
      label: 'circle',
      shape: 'circle',
      shapeProperties: { borderDashes: [5, 5] }
    },
    {
      id: 2,
      font: { size: 30 },
      label: 'ellipse',
      shape: 'ellipse',
      shapeProperties: { borderDashes: [5, 5] }
    },
    {
      id: 3,
      font: { size: 30 },
      label: 'database',
      shape: 'database',
      shapeProperties: { borderDashes: [5, 5] }
    },
    {
      id: 4,
      font: { size: 30 },
      label: 'box',
      shape: 'box',
      shapeProperties: { borderDashes: [5, 5] }
    },
    {
      id: 5,
      font: { size: 30 },
      size: 40,
      label: 'diamond',
      shape: 'diamond',
      shapeProperties: { borderDashes: [5, 5] }
    },
    {
      id: 6,
      font: { size: 30 },
      size: 40,
      label: 'dot',
      shape: 'dot',
      shapeProperties: { borderDashes: [5, 5] }
    },
    {
      id: 7,
      font: { size: 30 },
      size: 40,
      label: 'square',
      shape: 'square',
      shapeProperties: { borderDashes: [5, 5] }
    },
    {
      id: 8,
      font: { size: 30 },
      size: 40,
      label: 'triangle',
      shape: 'triangle',
      shapeProperties: { borderDashes: [5, 5] }
    },
    {
      id: 9,
      font: { size: 30 },
      size: 40,
      label: 'triangleDown',
      shape: 'triangleDown',
      shapeProperties: { borderDashes: [5, 5] }
    },
    {
      id: 10,
      font: { size: 30 },
      size: 40,
      label: 'star',
      shape: 'star',
      shapeProperties: { borderDashes: true }
    },
    {
      id: 11,
      font: { size: 30 },
      size: 40,
      label: 'circularImage',
      shape: 'circularImage',
      image: '../../img/indonesia/4.png',
      shapeProperties: { borderDashes: [15, 5] }
    },
    {
      id: 12,
      font: { size: 30 },
      size: 40,
      label: 'hexagon',
      shape: 'hexagon',
      shapeProperties: { borderDashes: [5, 5] }
    }
  ]

  let edges = []

  // create a network
  var container = document.getElementById('mynetwork')
  var data = {
    nodes: nodes,
    edges: edges
  }
  var options = { physics: { barnesHut: { gravitationalConstant: -4000 } } }
  new vis.Network(container, data, options)
}
