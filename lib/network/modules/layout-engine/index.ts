type Levels = Record<string | number, number>;
interface Edge {
  connected: boolean;
  from: Node;
  fromId: string | number;
  to: Node;
  toId: string | number;
}
interface Node {
  id: string | number;
  edges: Edge[];
}

/**
 * Try to assign levels to nodes according to their positions in the cyclic “hierarchy”.
 *
 * @param nodes - Nodes of the graph.
 * @param levels - If present levels will be added to it, if not a new object will be created.
 *
 * @returns Populated node levels.
 */
function fillLevelsByDirectionCyclic(nodes: Node[], levels: Levels): Levels {
  const edges = new Set<Edge>();
  nodes.forEach((node): void => {
    node.edges.forEach((edge): void => {
      if (edge.connected) {
        edges.add(edge);
      }
    });
  });

  edges.forEach((edge): void => {
    const fromId = edge.from.id;
    const toId = edge.to.id;

    if (levels[fromId] == null) {
      levels[fromId] = 0;
    }

    if (levels[toId] == null || levels[fromId] >= levels[toId]) {
      levels[toId] = levels[fromId] + 1;
    }
  });

  return levels;
}

/**
 * Assign levels to nodes according to their positions in the hierarchy. Leaves will be lined up at the bottom and all other nodes as close to their children as possible.
 *
 * @param nodes - Nodes of the graph.
 * @param levels - If present levels will be added to it, if not a new object will be created.
 *
 * @returns Populated node levels.
 */
export function fillLevelsByDirectionLeaves(
  nodes: Node[],
  levels: Levels = Object.create(null)
): Levels {
  return fillLevelsByDirection(
    (node): boolean => !node.edges.every((edge): boolean => edge.to === node),
    (node, edge): boolean => edge.to === node,
    (newLevel, oldLevel): boolean => oldLevel > newLevel,
    "from",
    nodes,
    levels
  );
}

/**
 * Assign levels to nodes according to their positions in the hierarchy. Roots will be lined up at the top and all nodes as close to their parents as possible.
 *
 * @param nodes - Nodes of the graph.
 * @param levels - If present levels will be added to it, if not a new object will be created.
 *
 * @returns Populated node levels.
 */
export function fillLevelsByDirectionRoots(
  nodes: Node[],
  levels: Levels = Object.create(null)
): Levels {
  return fillLevelsByDirection(
    (node): boolean => !node.edges.every((edge): boolean => edge.from === node),
    (node, edge): boolean => edge.from === node,
    (newLevel, oldLevel): boolean => oldLevel < newLevel,
    "to",
    nodes,
    levels
  );
}

/**
 * Assign levels to nodes according to their positions in the hierarchy.
 *
 * @param isEntryNode - Checks and return true if the graph should be traversed from this node.
 * @param shouldEdgeBeFollowed - Checks and returns true if the traversal should continue further through this edge.
 * @param shouldLevelBeReplaced - Checks and returns true if the level of given node should be updated to the new value.
 * @param direction - Wheter the graph should be traversed in the direction of the edges `"to"` or in the other way `"from"`.
 * @param nodes - Nodes of the graph.
 * @param levels - If present levels will be added to it, if not a new object will be created.
 *
 * @returns Populated node levels.
 */
function fillLevelsByDirection(
  isEntryNode: (node: Node) => boolean,
  shouldEdgeBeFollowed: (node: Node, edge: Edge) => boolean,
  shouldLevelBeReplaced: (newLevel: number, oldLevel: number) => boolean,
  direction: "to" | "from",
  nodes: Node[],
  levels: Levels
): Levels {
  const limit = nodes.length;
  const edgeIdProp = direction + "Id";
  const newLevelDiff = direction === "to" ? 1 : -1;

  for (const entryNode of nodes) {
    if (isEntryNode(entryNode)) {
      continue;
    }

    levels[entryNode.id] = 0;
    const stack: Node[] = [entryNode];

    let done = 0;
    let node: Node;
    while ((node = stack.pop()!)) {
      const newLevel = levels[node.id] + newLevelDiff;

      node.edges
        .filter(
          (edge): boolean =>
            edge.connected &&
            edge.to !== edge.from &&
            shouldEdgeBeFollowed(node, edge)
        )
        .forEach((edge): void => {
          const targetNodeId = edge[edgeIdProp];
          const oldLevel = levels[targetNodeId];

          if (oldLevel == null || shouldLevelBeReplaced(newLevel, oldLevel)) {
            levels[targetNodeId] = newLevel;
            stack.push(edge[direction]);
          }
        });

      if (done > limit) {
        // This would run forever on a cyclic graph.
        return fillLevelsByDirectionCyclic(nodes, levels);
      } else {
        ++done;
      }
    }
  }

  return levels;
}
