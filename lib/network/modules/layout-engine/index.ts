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
 * Detect whether a node is a part of a cycle.
 *
 * @param entryNode - Any node from the graph.
 *
 * @returns True if a cycle was found, false if no cycle was found.
 */
export function isInCycle(entryNode: Node): boolean {
  const stack: Node[] = entryNode.edges
    .filter(
      (edge): boolean => edge.connected === true && edge.from === entryNode
    )
    .map((edge): Node => edge.to)

  let node: Node | undefined
  while ((node = stack.pop())) {
    if (node === entryNode) {
      return true
    } else {
      stack.push(
        ...node.edges
          .filter(
            (edge): boolean => edge.connected === true && edge.from === node
          )
          .map((edge): Node => edge.to)
      )
    }
  }

  return false
}

/**
 * Detect cycle(s) in a graph.
 *
 * @TODO This is a very slow solution, optimize it!
 *
 * @param nodes - Nodes of the graph.
 *
 * @returns True if a cycle was found, false if no cycle was found.
 */
export function hasCycles(nodes: Node[]): boolean {
  return nodes.some(isInCycle)
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
  if (hasCycles(nodes)) {
    // Best effort for invalid (cyclic) hierarchy.
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
  } else {
    // Correct solution for valid hierarchy.
    nodes
      .filter((node): boolean =>
        node.edges.every((edge): boolean => edge.to === node)
      )
      .forEach((leaf): void => {
        levels[leaf.id] = 0
        const stack: Node[] = [leaf]

        let node: Node | undefined
        while ((node = stack.pop())) {
          const newLevel = levels[node.id] - 1
          node.edges
            .filter((edge): boolean => edge.connected && edge.to === node)
            .forEach((edge): void => {
              const fromId = edge.fromId
              const oldLevel = levels[fromId]
              if (oldLevel == null || oldLevel > newLevel) {
                levels[fromId] = newLevel
                stack.push(edge.from)
              }
            })
        }
      })
  }

  return levels
}
