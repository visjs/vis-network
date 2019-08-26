/* global vis */

const nodeFilterSelector = document.getElementById('nodeFilterSelect')
const edgeFilters = document.getElementsByName('edgesFilter')


// eslint-disable-next-line require-jsdoc
function startNetwork(data) {
  const container = document.getElementById('mynetwork')
  const options = {}
  new vis.Network(container, data, options)
}

/**
 * In this example we do not mutate nodes or edges source data.
 */
const nodes = new vis.DataSet([
  { id: 1, label: 'Eric Cartman', age: 'kid', gender: 'male' },
  { id: 2, label: 'Stan Marsh', age: 'kid', gender: 'male' },
  { id: 3, label: 'Wendy Testaburger', age: 'kid', gender: 'female'},
  { id: 4, label: 'Mr Mackey', age: 'adult', gender: 'male'},
  { id: 5, label: 'Sharon Marsh', age: 'adult', gender: 'female'}
])

const edges = new vis.DataSet([
  { from: 1, to: 2, relation: 'friend', arrows: 'to, from', color:{ color: 'red'} },
  { from: 1, to: 3, relation: 'friend', arrows: 'to, from', color:{ color: 'red'} },
  { from: 2, to: 3, relation: 'friend', arrows: 'to, from', color:{ color: 'red'} },
  { from: 5, to: 2, relation: 'parent', arrows: 'to', color:{ color: 'green'} },
  { from: 4, to: 1, relation: 'teacher', arrows: 'to', color:{ color: 'blue'}},
  { from: 4, to: 2, relation: 'teacher', arrows: 'to', color:{ color: 'blue'} },
  { from: 4, to: 3, relation: 'teacher', arrows: 'to', color:{ color: 'blue'} },
])

/**
 * filter values are updated in the outer scope.
 * in order to apply filters to new values, DataView.refresh() should be called
 */
let nodeFilterValue = ''
const edgesFilterValues = {
  friend: true,
  teacher: true,
  parent: true
}

/*
  filter function should return true or false
  based on whether item in DataView satisfies a given condition.
*/
const nodesFilter = node => {
  if (nodeFilterValue === '') {
    return true
  }
  switch(nodeFilterValue) {
    case('kid'):
      return node.age === 'kid'
    case('adult'):
      return node.age === 'adult'
    case('male'):
      return node.gender === 'male'
    case('female'):
      return node.gender === 'female'
    default:
       return true
  }
}

const edgesFilter = edge => {
  return edgesFilterValues[edge.relation]
}

const nodesView = new vis.DataView(nodes, { filter: nodesFilter })
const edgesView = new vis.DataView(edges, { filter: edgesFilter })


nodeFilterSelector.addEventListener('change', e => {
  // set new value to filter variable
  nodeFilterValue = e.target.value
  /*
    refresh DataView,
    so that its filter function is re-calculated with the new variable
   */
  nodesView.refresh()
})

edgeFilters.forEach(filter => filter.addEventListener('change', (e) => {
  const { value, checked } = e.target
  edgesFilterValues[value] = checked
  edgesView.refresh()
}))

startNetwork({ nodes: nodesView, edges: edgesView })
