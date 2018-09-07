/* global vis getScaleFreeNetwork */

var network = null
// randomly create some nodes and edges
var data = getScaleFreeNetwork(25)
var seed = 2

// eslint-disable-next-line require-jsdoc
function setDefaultLocale() {
  var defaultLocal = navigator.language
  var select = document.getElementById('locale')
  select.selectedIndex = 0 // set fallback value
  for (var i = 0, j = select.options.length; i < j; ++i) {
    if (select.options[i].getAttribute('value') === defaultLocal) {
      select.selectedIndex = i
      break
    }
  }
}

// eslint-disable-next-line require-jsdoc
function destroy() {
  if (network !== null) {
    network.destroy()
    network = null
  }
}

// eslint-disable-next-line require-jsdoc
function draw() {
  destroy()

  // create a network
  var container = document.getElementById('mynetwork')
  var options = {
    layout: { randomSeed: seed }, // just to make sure the layout is the same when the locale is changed
    locale: document.getElementById('locale').value,
    manipulation: {
      addNode: function(data, callback) {
        // filling in the popup DOM elements
        document.getElementById('node-operation').innerHTML = 'Add Node'
        editNode(data, clearNodePopUp, callback)
      },
      editNode: function(data, callback) {
        // filling in the popup DOM elements
        document.getElementById('node-operation').innerHTML = 'Edit Node'
        editNode(data, cancelNodeEdit, callback)
      },
      addEdge: function(data, callback) {
        if (data.from == data.to) {
          var r = confirm('Do you want to connect the node to itself?')
          if (r != true) {
            callback(null)
            return
          }
        }
        document.getElementById('edge-operation').innerHTML = 'Add Edge'
        editEdgeWithoutDrag(data, callback)
      },
      editEdge: {
        editWithoutDrag: function(data, callback) {
          document.getElementById('edge-operation').innerHTML = 'Edit Edge'
          editEdgeWithoutDrag(data, callback)
        }
      }
    }
  }
  network = new vis.Network(container, data, options)
}

// eslint-disable-next-line require-jsdoc
function editNode(data, cancelAction, callback) {
  document.getElementById('node-label').value = data.label
  document.getElementById('node-saveButton').onclick = saveNodeData.bind(
    this,
    data,
    callback
  )
  document.getElementById('node-cancelButton').onclick = cancelAction.bind(
    this,
    callback
  )
  document.getElementById('node-popUp').style.display = 'block'
}

// Callback passed as parameter is ignored
// eslint-disable-next-line require-jsdoc
function clearNodePopUp() {
  document.getElementById('node-saveButton').onclick = null
  document.getElementById('node-cancelButton').onclick = null
  document.getElementById('node-popUp').style.display = 'none'
}

// eslint-disable-next-line require-jsdoc
function cancelNodeEdit(callback) {
  clearNodePopUp()
  callback(null)
}

// eslint-disable-next-line require-jsdoc
function saveNodeData(data, callback) {
  data.label = document.getElementById('node-label').value
  clearNodePopUp()
  callback(data)
}

// eslint-disable-next-line require-jsdoc
function editEdgeWithoutDrag(data, callback) {
  // filling in the popup DOM elements
  document.getElementById('edge-label').value = data.label
  document.getElementById('edge-saveButton').onclick = saveEdgeData.bind(
    this,
    data,
    callback
  )
  document.getElementById('edge-cancelButton').onclick = cancelEdgeEdit.bind(
    this,
    callback
  )
  document.getElementById('edge-popUp').style.display = 'block'
}

// eslint-disable-next-line require-jsdoc
function clearEdgePopUp() {
  document.getElementById('edge-saveButton').onclick = null
  document.getElementById('edge-cancelButton').onclick = null
  document.getElementById('edge-popUp').style.display = 'none'
}

// eslint-disable-next-line require-jsdoc
function cancelEdgeEdit(callback) {
  clearEdgePopUp()
  callback(null)
}

// eslint-disable-next-line require-jsdoc
function saveEdgeData(data, callback) {
  if (typeof data.to === 'object') data.to = data.to.id
  if (typeof data.from === 'object') data.from = data.from.id
  data.label = document.getElementById('edge-label').value
  clearEdgePopUp()
  callback(data)
}

/* eslint-disable */
function init() {
  /* eslint-enable */
  setDefaultLocale()
  draw()
}
