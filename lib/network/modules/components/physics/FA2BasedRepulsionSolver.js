import BarnesHutSolver from "./BarnesHutSolver.js";
import { Alea } from "vis-util/esnext";

/**
 * @augments BarnesHutSolver
 */
class ForceAtlas2BasedRepulsionSolver extends BarnesHutSolver {
  /**
   * @param {object} body
   * @param {{physicsNodeIndices: Array, physicsEdgeIndices: Array, forces: {}, velocities: {}}} physicsBody
   * @param {object} options
   */
  constructor(body, physicsBody, options) {
    super(body, physicsBody, options);

    this._rng = Alea("FORCE ATLAS 2 BASED REPULSION SOLVER");
  }

  /**
   * The repulsion "charge" of a node: its mass weighted by its degree
   * (`edges.length + 1`). ForceAtlas2 scales repulsion by node degree so that
   * highly interconnected hubs are pushed to the periphery.
   *
   * The degree must enter the force symmetrically. ForceAtlas2's repulsion is
   * `k * (deg(a)+1) * (deg(b)+1) / distance` (Jacomy et al. 2014), i.e. it
   * depends on the product of both degrees, so the force on `a` from `b` equals
   * the force on `b` from `a` (Newton's third law). Applying the degree to only
   * the receiving node — as was done previously — makes the pairwise force
   * non-reciprocal and injects a net torque every tick. Velocity damping caps
   * but never removes it, so a converged layout spins about its center of mass
   * forever (issue #2193). Folding the degree into the mass used both to build
   * the Barnes-Hut tree and to evaluate the force keeps it reciprocal.
   * @param {Node} node
   * @returns {number} the degree-weighted mass of the node
   * @private
   */
  _getMass(node) {
    return node.options.mass * (node.edges.length + 1);
  }

  /**
   * Update the mass of a branch using the degree-weighted mass (see _getMass),
   * so the accumulated branch mass and its center of mass are consistent with
   * the degree-weighted repulsion applied in _calculateForces.
   * @param {object} parentBranch
   * @param {Node} node
   * @private
   */
  _updateBranchMass(parentBranch, node) {
    const mass = this._getMass(node);
    const centerOfMass = parentBranch.centerOfMass;
    const totalMass = parentBranch.mass + mass;
    const totalMassInv = 1 / totalMass;

    centerOfMass.x = centerOfMass.x * parentBranch.mass + node.x * mass;
    centerOfMass.x *= totalMassInv;

    centerOfMass.y = centerOfMass.y * parentBranch.mass + node.y * mass;
    centerOfMass.y *= totalMassInv;

    parentBranch.mass = totalMass;
    const biggestSize = Math.max(
      Math.max(node.height, node.radius),
      node.width,
    );
    parentBranch.maxWidth =
      parentBranch.maxWidth < biggestSize ? biggestSize : parentBranch.maxWidth;
  }

  /**
   * Calculate the forces based on the distance.
   * @param {number} distance
   * @param {number} dx
   * @param {number} dy
   * @param {Node} node
   * @param {object} parentBranch
   * @private
   */
  _calculateForces(distance, dx, dy, node, parentBranch) {
    if (distance === 0) {
      distance = 0.1 * this._rng();
      dx = distance;
    }

    if (this.overlapAvoidanceFactor < 1 && node.shape.radius) {
      distance = Math.max(
        0.1 + this.overlapAvoidanceFactor * node.shape.radius,
        distance - node.shape.radius,
      );
    }

    // dividing by the distance squared (rather than the cubed used by
    // BarnesHutSolver) yields ForceAtlas2's linear 1/distance repulsion once the
    // dx/dy components are factored in. Both parentBranch.mass and the node's
    // mass are degree-weighted (see _getMass), so the repulsion is proportional
    // to (degree+1) on both sides and stays reciprocal.
    const gravityForce =
      (this.options.gravitationalConstant *
        parentBranch.mass *
        this._getMass(node)) /
      Math.pow(distance, 2);
    const fx = dx * gravityForce;
    const fy = dy * gravityForce;

    this.physicsBody.forces[node.id].x += fx;
    this.physicsBody.forces[node.id].y += fy;
  }
}

export default ForceAtlas2BasedRepulsionSolver;
