/* global vis */

var nodes = [
  {
    id: 100,
    label: 'This node has no fixed, minimum or maximum width or height',
    x: -50,
    y: -300
  },
  {
    id: 210,
    widthConstraint: { minimum: 120 },
    label: 'This node has a mimimum width',
    x: -400,
    y: -200
  },
  {
    id: 211,
    widthConstraint: { minimum: 120 },
    label: '...so does this',
    x: -500,
    y: -50
  },
  {
    id: 220,
    widthConstraint: { maximum: 170 },
    label:
      'This node has a maximum width and breaks have been automatically inserted into the label',
    x: -150,
    y: -150
  },
  {
    id: 221,
    widthConstraint: { maximum: 170 },
    label: '...this too',
    x: -100,
    y: 0
  },
  {
    id: 200,
    font: { multi: true },
    widthConstraint: 150,
    label:
      '<b>This</b> node has a fixed width and breaks have been automatically inserted into the label',
    x: -300,
    y: 50
  },
  { id: 201, widthConstraint: 150, label: '...this as well', x: -300, y: 200 },
  {
    id: 300,
    heightConstraint: { minimum: 70 },
    label: 'This node\nhas a\nminimum\nheight',
    x: 100,
    y: -150
  },
  {
    id: 301,
    heightConstraint: { minimum: 70 },
    label: '...this one here too',
    x: 100,
    y: 0
  },
  {
    id: 400,
    heightConstraint: { minimum: 100, valign: 'top' },
    label: 'Minimum height\nvertical alignment\nmay be top',
    x: 300,
    y: -200
  },
  {
    id: 401,
    heightConstraint: { minimum: 100, valign: 'middle' },
    label: 'Minimum height\nvertical alignment\nmay be middle\n(default)',
    x: 300,
    y: 0
  },
  {
    id: 402,
    heightConstraint: { minimum: 100, valign: 'bottom' },
    label: 'Minimum height\nvertical alignment\nmay be bottom',
    x: 300,
    y: 200
  }
]

var edges = [
  { from: 100, to: 210, label: 'unconstrained to minimum width' },
  { from: 210, to: 211, label: 'more minimum width' },
  { from: 100, to: 220, label: 'unconstrained to maximum width' },
  { from: 220, to: 221, label: 'more maximum width' },
  { from: 210, to: 200, label: 'minimum width to fixed width' },
  { from: 220, to: 200, label: 'maximum width to fixed width' },
  { from: 200, to: 201, label: 'more fixed width' },
  { from: 100, to: 300, label: 'unconstrained to minimum height' },
  { from: 300, to: 301, label: 'more minimum height' },
  { from: 100, to: 400, label: 'unconstrained to top valign' },
  { from: 400, to: 401, label: 'top valign to middle valign' },
  {
    from: 401,
    to: 402,
    widthConstraint: { maximum: 150 },
    label: 'middle valign to bottom valign'
  }
]

var container = document.getElementById('mynetwork')
var data = {
  nodes: nodes,
  edges: edges
}
var options = {
  edges: {
    font: {
      size: 12
    },
    widthConstraint: {
      maximum: 90
    }
  },
  nodes: {
    shape: 'box',
    margin: 10,
    widthConstraint: {
      maximum: 200
    }
  },
  physics: {
    enabled: false
  }
}
new vis.Network(container, data, options)
