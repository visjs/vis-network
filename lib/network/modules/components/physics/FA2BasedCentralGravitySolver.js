import CentralGravitySolver from "./CentralGravitySolver";

/**
 * @augments CentralGravitySolver
 */
class ForceAtlas2BasedCentralGravitySolver extends CentralGravitySolver {
  /**
   * @param {object} body
   * @param {{physicsNodeIndices: Array, physicsEdgeIndices: Array, forces: {}, velocities: {}}} physicsBody
   * @param {object} options
   */
  constructor(body, physicsBody, options) {
    super(body, physicsBody, options);
  }

  /**
   * Calculate the forces based on the distance.
   *
   * @param {number} distance
   * @param {number} dx
   * @param {number} dy
   * @param {object<Node.id, Node>} forces
   * @param {Node} node
   * @private
   */
  _calculateForces(distance, dx, dy, forces, node) {
    if (distance > 0) {
      const degree = node.edges.length + 1;
      const gravityForce =
        this.options.centralGravity * degree * node.options.mass;
      forces[node.id].x = dx * gravityForce;
      forces[node.id].y = dy * gravityForce;
    }
  }
}

export default ForceAtlas2BasedCentralGravitySolver;
