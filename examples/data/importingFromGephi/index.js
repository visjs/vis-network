/* global vis loadJSON */
var network

var nodes = new vis.DataSet()
var edges = new vis.DataSet()
var gephiImported
var fixedCheckbox = document.getElementById('fixed')
fixedCheckbox.onchange = redrawAll

var parseColorCheckbox = document.getElementById('parseColor')
parseColorCheckbox.onchange = redrawAll

var nodeContent = document.getElementById('nodeContent')

loadJSON('../../datasources/WorldCup2014.json', redrawAll, function(err) {
  console.log('error', err)
})

var container = document.getElementById('mynetwork')
var data = {
  nodes: nodes,
  edges: edges
}
var options = {
  nodes: {
    shape: 'dot',
    font: {
      face: 'Tahoma'
    }
  },
  edges: {
    width: 0.15,
    smooth: {
      type: 'continuous'
    }
  },
  interaction: {
    tooltipDelay: 200,
    hideEdgesOnDrag: true
  },
  physics: {
    stabilization: false,
    barnesHut: {
      gravitationalConstant: -10000,
      springConstant: 0.002,
      springLength: 150
    }
  }
}

new vis.Network(container, data, options)
network.on('click', function(params) {
  if (params.nodes.length > 0) {
    var data = nodes.get(params.nodes[0]) // get the data from selected node
    nodeContent.innerHTML = JSON.stringify(data, undefined, 3) // show the data in the div
  }
})

/**
 * This function fills the DataSets. These DataSets will update the network.
 */
// eslint-disable-next-line require-jsdoc
function redrawAll(gephiJSON) {
  if (gephiJSON.nodes === undefined) {
    gephiJSON = gephiImported
  } else {
    gephiImported = gephiJSON
  }

  nodes.clear()
  edges.clear()

  var fixed = fixedCheckbox.checked
  var parseColor = parseColorCheckbox.checked

  var parsed = vis.network.gephiParser.parseGephi(gephiJSON, {
    fixed: fixed,
    parseColor: parseColor
  })

  // add the parsed data to the DataSets.
  nodes.add(parsed.nodes)
  edges.add(parsed.edges)

  var data = nodes.get(2) // get the data from node 2 as example
  nodeContent.innerHTML = JSON.stringify(data, undefined, 3) // show the data in the div
  network.fit() // zoom to fit
}
