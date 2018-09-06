/* global draw */

var directionInput = document.getElementById('direction')
var btnUD = document.getElementById('btn-UD')
btnUD.onclick = function() {
  directionInput.value = 'UD'
  draw()
}
var btnDU = document.getElementById('btn-DU')
btnDU.onclick = function() {
  directionInput.value = 'DU'
  draw()
}
var btnLR = document.getElementById('btn-LR')
btnLR.onclick = function() {
  directionInput.value = 'LR'
  draw()
}
var btnRL = document.getElementById('btn-RL')
btnRL.onclick = function() {
  directionInput.value = 'RL'
  draw()
}
