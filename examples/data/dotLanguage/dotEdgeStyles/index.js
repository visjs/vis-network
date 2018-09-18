/* global vis $ */
var dotDefault =
  'digraph {\n' +
  ' // Parent nodes\n' +
  ' lines[label="LINES"]; \n' +
  ' ahs[label="ARROW HEADS"]; \n' +
  '\n' +
  ' // Child nodes\n' +
  ' dot[label="both dot"]; \n' +
  ' vee[label="back vee"]; \n' +
  ' diamond[label="diamond and box"]; \n' +
  '\n' +
  ' // Line styles\n' +
  ' lines -- solid[label="solid pink", color="pink"]; \n' +
  ' lines -- penwidth[label="penwidth=5", penwidth=5]; \n' +
  ' lines -- dashed[label="dashed green", style="dashed", color="green"]; \n' +
  ' lines -- dotted[label="dotted purple", style="dotted", color="purple"]; \n' +
  '\n' +
  ' // Arrowhead styles\n' +
  ' ahs -> box[label="box", arrowhead=box]; \n' +
  ' ahs -> crow[label="crow", arrowhead=crow]; \n' +
  ' ahs -> curve[label="curve", arrowhead=curve]; \n' +
  ' ahs -> icurve[label="icurve", arrowhead=icurve]; \n' +
  ' ahs -> normal[label="normal", arrowhead=normal]; \n' +
  ' ahs -> inv[label="inv", arrowhead=inv]; \n' +
  ' ahs -> diamond[label="diamond and box", dir=both, arrowhead=diamond, arrowtail=box]; \n' +
  ' ahs -> dot[label="both dot", dir=both, arrowhead=dot, arrowtail=dot]; \n' +
  ' ahs -> tee[label="tee", arrowhead=tee]; \n' +
  ' ahs -> vee[label="back vee", dir=back, arrowtail=vee]; \n' +
  '}'

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
$('#reset').click(reset)

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

// eslint-disable-next-line require-jsdoc
function reset() {
  $('#data').val(dotDefault)
  draw()
}

window.onload = function() {
  reset()
}
