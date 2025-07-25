/**
 * Hierarchical Repulsion Solver
 */
class HierarchicalRepulsionSolver {
  /**
   * @param {object} body
   * @param {{physicsNodeIndices: Array, physicsEdgeIndices: Array, forces: {}, velocities: {}}} physicsBody
   * @param {object} options
   */
  constructor(body, physicsBody, options) {
    this.body = body;
    this.physicsBody = physicsBody;
    this.setOptions(options);
  }

  /**
   *
   * @param {object} options
   */
  setOptions(options) {
    this.options = options;
    this.overlapAvoidanceFactor = Math.max(
      0,
      Math.min(1, this.options.avoidOverlap || 0),
    );
  }

  /**
   * Calculate the forces the nodes apply on each other based on a repulsion field.
   * This field is linearly approximated.
   * @private
   */
  solve() {
    const nodes = this.body.nodes;
    const nodeIndices = this.physicsBody.physicsNodeIndices;
    const forces = this.physicsBody.forces;

    // repulsing forces between nodes
    const nodeDistance = this.options.nodeDistance;

    // we loop from i over all but the last entree in the array
    // j loops from i+1 to the last. This way we do not double count any of the indices, nor i === j
    for (let i = 0; i < nodeIndices.length - 1; i++) {
      const node1 = nodes[nodeIndices[i]];
      for (let j = i + 1; j < nodeIndices.length; j++) {
        const node2 = nodes[nodeIndices[j]];

        // nodes only affect nodes on their level
        if (node1.level === node2.level) {
          const theseNodesDistance =
            nodeDistance +
            this.overlapAvoidanceFactor *
              ((node1.shape.radius || 0) / 2 + (node2.shape.radius || 0) / 2);

          const dx = node2.x - node1.x;
          const dy = node2.y - node1.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          const steepness = 0.05;
          let repulsingForce;
          if (distance < theseNodesDistance) {
            repulsingForce =
              -Math.pow(steepness * distance, 2) +
              Math.pow(steepness * theseNodesDistance, 2);
          } else {
            repulsingForce = 0;
          }
          // normalize force with
          if (distance !== 0) {
            repulsingForce = repulsingForce / distance;
          }
          const fx = dx * repulsingForce;
          const fy = dy * repulsingForce;

          forces[node1.id].x -= fx;
          forces[node1.id].y -= fy;
          forces[node2.id].x += fx;
          forces[node2.id].y += fy;
        }
      }
    }
  }
}

export default HierarchicalRepulsionSolver;
