/* global vis */
// create an array with nodes
var nodes = new vis.DataSet([
  {
    id: 1,
    shape: 'image',
    size: 20,
    label: 'No select image',
    image: './unselected.svg'
  },
  {
    id: 2,
    shape: 'image',
    size: 20,
    label: 'Select image broken',
    image: {
      unselected: './unselected.svg',
      selected: './BROKEN_LINK/selected.svg'
    }
  },
  {
    id: 3,
    shape: 'image',
    size: 20,
    label: 'Select works!',
    image: {
      unselected: './unselected.svg',
      selected: './selected.svg'
    },
    shapeProperties: {
      borderDashes: [15, 5],
      interpolation: false
    }
  }
])

// create an array with edges
var edges = new vis.DataSet([{ from: 1, to: 2 }, { from: 2, to: 3 }])

// create a network
var container = document.getElementById('mynetwork')

// provide the data in the vis format
var data = {
  nodes: nodes,
  edges: edges
}

var options = {
  layout: {
    randomSeed: 5
  },
  nodes: {
    brokenImage: './broken-image.png'
  }
}
// initialize!
new vis.Network(container, data, options)
