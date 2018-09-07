/* global draw */
var dropdown = document.getElementById('layout')
dropdown.onchange = function() {
  // eslint-disable-next-line
  layoutMethod = dropdown.value
  draw()
}
