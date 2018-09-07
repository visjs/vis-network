/* global vis $ */
// create a network
var container = document.getElementById('mynetwork')
var options = {
  physics: {
    stabilization: false,
    barnesHut: {
      springLength: 200
    }
  }
}
var data = {}
const network = new vis.Network(container, data, options)

$('#draw').click(draw)

$('a.example').click(function(event) {
  var url = $(event.target).data('url')
  $.get(url)
    .done(function(dotData) {
      $('#data').val(dotData)
      draw()
    })
    .fail(function() {
      $('#error').html(
        'Error: Cannot fetch the example data because of security restrictions in JavaScript. Run the example from a server instead of as a local file to resolve this problem. Alternatively, you can copy/paste the data of DOT graphs manually in the textarea below.'
      )
      resize()
    })
})

$(window).resize(resize)
$(window).load(draw)

$('#data').keydown(function(event) {
  if (event.ctrlKey && event.keyCode === 13) {
    // Ctrl+Enter
    draw()
    event.stopPropagation()
    event.preventDefault()
  }
})

// eslint-disable-next-line require-jsdoc
function resize() {
  $('#contents').height($('body').height() - $('#header').height() - 30)
}

// eslint-disable-next-line require-jsdoc
function draw() {
  try {
    resize()
    $('#error').html('')

    // Provide a string with data in DOT language
    data = vis.network.convertDot($('#data').val())

    network.setData(data)
  } catch (err) {
    // set the cursor at the position where the error occurred
    var match = /\(char (.*)\)/.exec(err)
    if (match) {
      var pos = Number(match[1])
      var textarea = $('#data')[0]
      if (textarea.setSelectionRange) {
        textarea.focus()
        textarea.setSelectionRange(pos, pos)
      }
    }

    // show an error message
    $('#error').html(err.toString())
  }
}
