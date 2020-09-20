/**
 * Hierarchical Spring Solver
 */
class HierarchicalSpringSolver {
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
  }

  /**
   * This function calculates the springforces on the nodes, accounting for the support nodes.
   *
   * @private
   */
  solve() {
    let edgeLength, edge;
    let dx, dy, fx, fy, springForce, distance;
    const edges = this.body.edges;
    const factor = 0.5;

    const edgeIndices = this.physicsBody.physicsEdgeIndices;
    const nodeIndices = this.physicsBody.physicsNodeIndices;
    const forces = this.physicsBody.forces;

    // initialize the spring force counters
    for (let i = 0; i < nodeIndices.length; i++) {
      const nodeId = nodeIndices[i];
      forces[nodeId].springFx = 0;
      forces[nodeId].springFy = 0;
    }

    // forces caused by the edges, modelled as springs
    for (let i = 0; i < edgeIndices.length; i++) {
      edge = edges[edgeIndices[i]];
      if (edge.connected === true) {
        edgeLength =
          edge.options.length === undefined
            ? this.options.springLength
            : edge.options.length;

        dx = edge.from.x - edge.to.x;
        dy = edge.from.y - edge.to.y;
        distance = Math.sqrt(dx * dx + dy * dy);
        distance = distance === 0 ? 0.01 : distance;

        // the 1/distance is so the fx and fy can be calculated without sine or cosine.
        springForce =
          (this.options.springConstant * (edgeLength - distance)) / distance;

        fx = dx * springForce;
        fy = dy * springForce;

        if (edge.to.level != edge.from.level) {
          if (forces[edge.toId] !== undefined) {
            forces[edge.toId].springFx -= fx;
            forces[edge.toId].springFy -= fy;
          }
          if (forces[edge.fromId] !== undefined) {
            forces[edge.fromId].springFx += fx;
            forces[edge.fromId].springFy += fy;
          }
        } else {
          if (forces[edge.toId] !== undefined) {
            forces[edge.toId].x -= factor * fx;
            forces[edge.toId].y -= factor * fy;
          }
          if (forces[edge.fromId] !== undefined) {
            forces[edge.fromId].x += factor * fx;
            forces[edge.fromId].y += factor * fy;
          }
        }
      }
    }

    // normalize spring forces
    springForce = 1;
    let springFx, springFy;
    for (let i = 0; i < nodeIndices.length; i++) {
      const nodeId = nodeIndices[i];
      springFx = Math.min(
        springForce,
        Math.max(-springForce, forces[nodeId].springFx)
      );
      springFy = Math.min(
        springForce,
        Math.max(-springForce, forces[nodeId].springFy)
      );

      forces[nodeId].x += springFx;
      forces[nodeId].y += springFy;
    }

    // retain energy balance
    let totalFx = 0;
    let totalFy = 0;
    for (let i = 0; i < nodeIndices.length; i++) {
      const nodeId = nodeIndices[i];
      totalFx += forces[nodeId].x;
      totalFy += forces[nodeId].y;
    }
    const correctionFx = totalFx / nodeIndices.length;
    const correctionFy = totalFy / nodeIndices.length;

    for (let i = 0; i < nodeIndices.length; i++) {
      const nodeId = nodeIndices[i];
      forces[nodeId].x -= correctionFx;
      forces[nodeId].y -= correctionFy;
    }
  }
}

export default HierarchicalSpringSolver;
