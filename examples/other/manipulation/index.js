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
        document.getElementById('operation').innerHTML = 'Add Node'
        document.getElementById('node-id').value = data.id
        document.getElementById('node-label').value = data.label
        document.getElementById('saveButton').onclick = saveData.bind(
          this,
          data,
          callback
        )
        document.getElementById('cancelButton').onclick = clearPopUp.bind()
        document.getElementById('network-popUp').style.display = 'block'
      },
      editNode: function(data, callback) {
        // filling in the popup DOM elements
        document.getElementById('operation').innerHTML = 'Edit Node'
        document.getElementById('node-id').value = data.id
        document.getElementById('node-label').value = data.label
        document.getElementById('saveButton').onclick = saveData.bind(
          this,
          data,
          callback
        )
        document.getElementById('cancelButton').onclick = cancelEdit.bind(
          this,
          callback
        )
        document.getElementById('network-popUp').style.display = 'block'
      },
      addEdge: function(data, callback) {
        if (data.from == data.to) {
          var r = confirm('Do you want to connect the node to itself?')
          if (r == true) {
            callback(data)
          }
        } else {
          callback(data)
        }
      }
    }
  }
  network = new vis.Network(container, data, options)
}

// eslint-disable-next-line require-jsdoc
function clearPopUp() {
  document.getElementById('saveButton').onclick = null
  document.getElementById('cancelButton').onclick = null
  document.getElementById('network-popUp').style.display = 'none'
}

// eslint-disable-next-line require-jsdoc
function cancelEdit(callback) {
  clearPopUp()
  callback(null)
}

// eslint-disable-next-line require-jsdoc
function saveData(data, callback) {
  data.id = document.getElementById('node-id').value
  data.label = document.getElementById('node-label').value
  clearPopUp()
  callback(data)
}

/* eslint-disable */
function init() {
  /* eslint-enable */
  setDefaultLocale()
  draw()
}
