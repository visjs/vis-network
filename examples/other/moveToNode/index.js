/* global vis getScaleFreeNetwork */

var network = null
var offsetx, offsety, positionx, positiony, duration, easingFunction
var statusUpdateSpan
var finishMessage = ''
var amountOfNodes = 25

// eslint-disable-next-line require-jsdoc
function destroy() {
  if (network !== null) {
    network.destroy()
    network = null
  }
}

/* eslint-disable */
function draw() {
  /* eslint-enable */
  destroy()
  statusUpdateSpan = document.getElementById('statusUpdate')

  // randomly create some nodes and edges
  var data = getScaleFreeNetwork(amountOfNodes)

  // create a network
  var container = document.getElementById('mynetwork')
  var options = {
    physics: {
      stabilization: {
        iterations: 1200
      }
    },
    nodes: {
      shape: 'circle',
      widthConstraint: {
        minimum: 40,
        maximum: 40
      },
      font: {
        size: 24
      }
    }
  }
  network = new vis.Network(container, data, options)

  // add event listeners
  network.on('select', function(params) {
    document.getElementById('selection').innerHTML =
      'Selection: ' + params.nodes
  })
  network.on('stabilized', function(params) {
    document.getElementById('stabilization').innerHTML =
      'Stabilization took ' + params.iterations + ' iterations.'
  })
  network.on('animationFinished', function() {
    statusUpdateSpan.innerHTML = finishMessage
  })

  // your form
  var form = document.getElementById('nodeIdForm')

  // attach event listener
  form.addEventListener('submit', focusNode, false)
}

/* eslint-disable */
function fitAnimated() {
  /* eslint-enable */
  var options = {
    offset: { x: offsetx, y: offsety },
    duration: duration,
    easingFunction: easingFunction
  }
  statusUpdateSpan.innerHTML = 'Doing fit() Animation.'
  finishMessage = 'Animation finished.'
  network.fit({ animation: options })
}

/* eslint-disable */
function doDefaultAnimation() {
  /* eslint-enable */
  var options = {
    position: { x: positionx, y: positiony },
    offset: { x: offsetx, y: offsety },
    animation: true // default duration is 1000ms and default easingFunction is easeInOutQuad.
  }
  statusUpdateSpan.innerHTML = 'Doing Animation.'
  finishMessage = 'Animation finished.'
  network.moveTo(options)
}

// eslint-disable-next-line require-jsdoc
function focusNode(event) {
  event.preventDefault()
  console.log('event', event)

  const nodeId = event.srcElement[0].value

  console.log('easingFunction', easingFunction)
  console.log('offsetx', offsetx)
  console.log('offsety', offsety)
  console.log('duration', duration)

  var options = {
    // position: {x:positionx,y:positiony}, // this is not relevant when focusing on nodes
    offset: { x: offsetx, y: offsety },
    animation: {
      duration: duration,
      easingFunction: easingFunction
    }
  }
  statusUpdateSpan.innerHTML = 'Focusing on node: ' + nodeId
  finishMessage = 'Node: ' + nodeId + ' in focus.'
  network.focus(nodeId, options)
}
