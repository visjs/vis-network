// prettier-ignore
// eslint-disable-next-line valid-jsdoc
/**
 * Created by Alex on 5/20/2015.
 */
function loadJSON(path, success, error) { // eslint-disable-line no-unused-vars
  var xhr = new XMLHttpRequest()
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        success(JSON.parse(xhr.responseText))
      } else {
        error(xhr)
      }
    }
  }
  xhr.open('GET', path, true)
  xhr.send()
}

/* eslint-disable */
function getScaleFreeNetwork(nodeCount) {
  /* eslint-enable */
  var nodes = []
  var edges = []
  var connectionCount = []

  // randomly create some nodes and edges
  for (var i = 0; i < nodeCount; i++) {
    nodes.push({
      id: i,
      label: String(i)
    })

    connectionCount[i] = 0

    // create edges in a scale-free-network way
    if (i == 1) {
      let from = i
      let to = 0
      edges.push({
        from: from,
        to: to
      })
      connectionCount[from]++
      connectionCount[to]++
    } else if (i > 1) {
      var conn = edges.length * 2
      var rand = Math.floor(Math.random() * conn)
      var cum = 0
      var j = 0
      while (j < connectionCount.length && cum < rand) {
        cum += connectionCount[j]
        j++
      }

      var from = i
      var to = j
      edges.push({
        from: from,
        to: to
      })
      connectionCount[from]++
      connectionCount[to]++
    }
  }

  return { nodes: nodes, edges: edges }
}

var randomSeed = 764 // Math.round(Math.random()*1000);
// eslint-disable-next-line require-jsdoc
function seededRandom() {
  var x = Math.sin(randomSeed++) * 10000
  return x - Math.floor(x)
}

/* eslint-disable */
function getScaleFreeNetworkSeeded(nodeCount, seed) {
  /* eslint-enable */
  if (seed) {
    randomSeed = Number(seed)
  }
  var nodes = []
  var edges = []
  var connectionCount = []
  var edgesId = 0

  // randomly create some nodes and edges
  for (var i = 0; i < nodeCount; i++) {
    nodes.push({
      id: i,
      label: String(i)
    })

    connectionCount[i] = 0

    // create edges in a scale-free-network way
    if (i == 1) {
      var from = i
      var to = 0
      edges.push({
        id: edgesId++,
        from: from,
        to: to
      })
      connectionCount[from]++
      connectionCount[to]++
    } else if (i > 1) {
      var conn = edges.length * 2
      var rand = Math.floor(seededRandom() * conn)
      var cum = 0
      var j = 0
      while (j < connectionCount.length && cum < rand) {
        cum += connectionCount[j]
        j++
      }

      let from = i
      let to = j
      edges.push({
        id: edgesId++,
        from: from,
        to: to
      })
      connectionCount[from]++
      connectionCount[to]++
    }
  }

  return { nodes: nodes, edges: edges }
}
