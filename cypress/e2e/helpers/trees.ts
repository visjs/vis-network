import { Edge, Node, TestData } from "./common";

/**
 * Generate m-ary tree with given amount of nodes. The nodes have ids
 * `"node${nm}"` where nm is a number sturting from 0 which is the root of the
 * tree and increasing by one with each node in top to bottom left to right
 * direction.
 *
 * @param amount - The amount of nodes in the tree.
 * @param m - The maximum amount of child nodes per parent node.
 * @returns Nodes and edges that can be directly supplied to Vis Network.
 */
export function generateMaryTree(amount = 63, m = 2): TestData {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  const node0 = { id: "node0", label: "Node #0" };
  nodes.push(node0);

  for (let i = 1; i < amount; ++i) {
    const id = `node${i}`;
    const parentNode = nodes[Math.floor((i - 1) / m)];
    const parentId = parentNode.id!;

    const node = { id, label: `Node #${i}` };
    nodes.push(node);
    edges.push({
      id: `edge_${parentId}-${id}`,
      label: `${parentId} - ${id}`,
      from: parentId,
      to: id,
    });
  }

  return { nodes, edges };
}

/**
 * Take existing data and put more edges between the nodes. If used on the
 * output of `generateMaryTree` it gets turned into acyclic graph.
 *
 * @param data - The data to be altered.
 * @returns The same objects as the argument data.
 */
export function addMoreEdges(data: TestData): TestData {
  const nodes = data.nodes;
  const edges = data.edges;

  for (let i = 1; i < nodes.length; ++i) {
    if (i % 2 === 0) {
      const id = nodes[i].id;
      const parentNode = nodes[Math.floor((i - 1) / 3)];
      const parentId = parentNode.id!;

      edges.push({
        id: `edge2_${parentId}-${id}`,
        label: `${parentId} - ${id}`,
        from: parentId,
        to: id,
      });
    }
  }

  return data;
}
