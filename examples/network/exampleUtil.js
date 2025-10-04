// This is quite old and I don't want to waste too much time here. We probably
// should stop using this altogether as the examples should be easy and
// straightforward to understand and this only obscures it.
/* eslint jsdoc/require-jsdoc: "off" */

/* global Alea:false */

/**
 * Created by Alex on 5/20/2015.
 * @remarks
 * This depends on Alea from https://unpkg.com/alea@1.0.0/alea.js.
 */

const seededRandom = Alea("SEED");

export function generateRandomNodesAndEdges(nodeCount) {
  const nodes = [];
  const edges = [];
  const connectionCount = [];

  // randomly create some nodes and edges
  for (let i = 0; i < nodeCount; i++) {
    nodes.push({
      id: i,
      label: String(i),
    });

    connectionCount[i] = 0;

    // create edges in a scale-free-network way
    if (i == 1) {
      const from = i;
      const to = 0;
      edges.push({
        from: from,
        to: to,
      });
      connectionCount[from]++;
      connectionCount[to]++;
    } else if (i > 1) {
      const conn = edges.length * 2;
      const rand = Math.floor(seededRandom() * conn);
      let cum = 0;
      let j = 0;
      while (j < connectionCount.length && cum < rand) {
        cum += connectionCount[j];
        j++;
      }

      const from = i;
      const to = j;
      edges.push({
        from: from,
        to: to,
      });
      connectionCount[from]++;
      connectionCount[to]++;
    }
  }

  return { nodes: nodes, edges: edges };
}
