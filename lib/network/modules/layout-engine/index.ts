type Levels = Record<string | number, number>
interface Edge {
  connected: boolean
  from: Node
  fromId: string | number
  to: Node
  toId: string | number
}
interface Node {
  id: string | number
  edges: Edge[]
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
  const edges = new Set<Edge>()
  nodes.forEach((node): void => {
    node.edges.forEach((edge): void => {
      if (edge.connected) {
        edges.add(edge)
      }
    })
  })

  edges.forEach((edge): void => {
    const fromId = edge.from.id
    const toId = edge.to.id

    if (levels[fromId] == null) {
      levels[fromId] = 0
    }

    if (levels[toId] == null || levels[fromId] >= levels[toId]) {
      levels[toId] = levels[fromId] + 1
    }
  })

  return levels
}

/**
 * Assign levels to nodes according to their positions in the hierarchy.
 *
 * @param nodes - Nodes of the graph.
 * @param levels - If present levels will be added to it, if not a new object will be created.
 *
 * @returns Populated node levels.
 */
export function fillLevelsByDirection(
  nodes: Node[],
  levels: Levels = Object.create(null)
): Levels {
  const limit = nodes.length

  for (const leaf of nodes) {
    if (!leaf.edges.every((edge): boolean => edge.to === leaf)) {
      // Not a leaf.
      continue
    }

    levels[leaf.id] = 0
    const stack: Node[] = [leaf]

    let done = 0
    let node: Node | undefined
    while ((node = stack.pop())) {
      const edges = node.edges
      const newLevel = levels[node.id] - 1

      for (const edge of edges) {
        if (!edge.connected || edge.to !== node) {
          continue
        }

        const fromId = edge.fromId
        const oldLevel = levels[fromId]
        if (oldLevel == null || oldLevel > newLevel) {
          levels[fromId] = newLevel
          stack.push(edge.from)
        }
      }

      if (done > limit) {
        // This would run forever on a cyclic graph.
        return fillLevelsByDirectionCyclic(nodes, levels)
      } else {
        ++done
      }
    }
  }

  return levels
}
