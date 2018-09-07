/* global vis */

/* eslint-disable */
function draw() {
  /* eslint-enable */
  /*
  * Example for FontAwesome
  */
  var optionsFA = {
    groups: {
      usergroups: {
        shape: 'icon',
        icon: {
          face: 'FontAwesome',
          code: '\uf0c0',
          size: 50,
          color: '#57169a'
        }
      },
      users: {
        shape: 'icon',
        icon: {
          face: 'FontAwesome',
          code: '\uf007',
          size: 50,
          color: '#aa00ff'
        }
      }
    }
  }

  // create an array with nodes
  var nodesFA = [
    {
      id: 1,
      label: 'User 1',
      group: 'users'
    },
    {
      id: 2,
      label: 'User 2',
      group: 'users'
    },
    {
      id: 3,
      label: 'Usergroup 1',
      group: 'usergroups'
    },
    {
      id: 4,
      label: 'Usergroup 2',
      group: 'usergroups'
    },
    {
      id: 5,
      label: 'Organisation 1',
      shape: 'icon',
      icon: {
        face: 'FontAwesome',
        code: '\uf1ad',
        size: 50,
        color: '#f0a30a'
      }
    }
  ]

  // create an array with edges
  var edges = [
    {
      from: 1,
      to: 3
    },
    {
      from: 1,
      to: 4
    },
    {
      from: 2,
      to: 4
    },
    {
      from: 3,
      to: 5
    },
    {
      from: 4,
      to: 5
    }
  ]

  // create a network
  var containerFA = document.getElementById('mynetworkFA')
  var dataFA = {
    nodes: nodesFA,
    edges: edges
  }

  new vis.Network(containerFA, dataFA, optionsFA)

  /*
       * Example for Ionicons
       */
  var optionsIO = {
    groups: {
      usergroups: {
        shape: 'icon',
        icon: {
          face: 'Ionicons',
          code: '\uf47c',
          size: 50,
          color: '#57169a'
        }
      },
      users: {
        shape: 'icon',
        icon: {
          face: 'Ionicons',
          code: '\uf47e',
          size: 50,
          color: '#aa00ff'
        }
      }
    }
  }

  // create an array with nodes
  var nodesIO = [
    {
      id: 1,
      label: 'User 1',
      group: 'users'
    },
    {
      id: 2,
      label: 'User 2',
      group: 'users'
    },
    {
      id: 3,
      label: 'Usergroup 1',
      group: 'usergroups'
    },
    {
      id: 4,
      label: 'Usergroup 2',
      group: 'usergroups'
    },
    {
      id: 5,
      label: 'Organisation 1',
      shape: 'icon',
      icon: {
        face: 'Ionicons',
        code: '\uf276',
        size: 50,
        color: '#f0a30a'
      }
    }
  ]

  // create a network
  var containerIO = document.getElementById('mynetworkIO')
  var dataIO = {
    nodes: nodesIO,
    edges: edges
  }

  new vis.Network(containerIO, dataIO, optionsIO)
}
