type Levels = Record<string | number, number>
interface Edge {
  from: Node
  to: Node
  connected: boolean
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
 * @param edges - Edges of the graph.
 *
 * @returns True if a cycle was found, false if no cycle was found.
 */
export function hasCycles(edges: Edge[]): boolean {
  return edges.some(
    (edge): boolean => isInCycle(edge.from) || isInCycle(edge.to)
  )
}

/**
 * Assign levels to nodes according to their positions in the hierarchy.
 *
 * @param edges - Edges of the graph.
 * @param levels - If present levels will be added to it, if not a new object will be created.
 *
 * @returns Populated node levels.
 */
export function fillLevelsByDirection(
  edges: Edge[],
  levels: Levels = Object.create(null)
): Levels {
  if (hasCycles(edges)) {
    // Best effort for invalid hierarchy.
    const stack: Edge[] = edges

    let edge: Edge | undefined
    while ((edge = stack.pop())) {
      const fromId = edge.from.id
      const toId = edge.to.id

      if (levels[fromId] == null) {
        levels[fromId] = 0
      }

      if (levels[toId] == null || levels[fromId] >= levels[toId]) {
        levels[toId] = levels[fromId] + 1
      }
    }
  } else {
    // Correct solution for valid hierarchy.
    const stack: Edge[] = edges.slice()

    let edge: Edge | undefined
    while ((edge = stack.pop())) {
      const fromId = edge.from.id
      const toId = edge.to.id

      if (levels[fromId] == null) {
        levels[fromId] = 0
        stack.push(
          ...edge.from.edges.filter(
            (e): boolean =>
              e.connected === true && e !== edge && e.to === edge!.from
          )
        )
      }

      if (levels[toId] == null || levels[fromId] >= levels[toId]) {
        levels[toId] = levels[fromId] + 1
        stack.push(
          ...edge.to.edges.filter(
            (e): boolean =>
              e.connected === true && e !== edge && e.from === edge!.to
          )
        )
      }
    }
  }

  return levels
}
