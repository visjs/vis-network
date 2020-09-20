import { Alea } from "vis-util/esnext";

/**
 * Barnes Hut Solver
 */
class BarnesHutSolver {
  /**
   * @param {object} body
   * @param {{physicsNodeIndices: Array, physicsEdgeIndices: Array, forces: {}, velocities: {}}} physicsBody
   * @param {object} options
   */
  constructor(body, physicsBody, options) {
    this.body = body;
    this.physicsBody = physicsBody;
    this.barnesHutTree;
    this.setOptions(options);
    this._rng = Alea("BARNES HUT SOLVER");

    // debug: show grid
    // this.body.emitter.on("afterDrawing", (ctx) => {this._debug(ctx,'#ff0000')})
  }

  /**
   *
   * @param {object} options
   */
  setOptions(options) {
    this.options = options;
    this.thetaInversed = 1 / this.options.theta;

    // if 1 then min distance = 0.5, if 0.5 then min distance = 0.5 + 0.5*node.shape.radius
    this.overlapAvoidanceFactor =
      1 - Math.max(0, Math.min(1, this.options.avoidOverlap));
  }

  /**
   * This function calculates the forces the nodes apply on each other based on a gravitational model.
   * The Barnes Hut method is used to speed up this N-body simulation.
   *
   * @private
   */
  solve() {
    if (
      this.options.gravitationalConstant !== 0 &&
      this.physicsBody.physicsNodeIndices.length > 0
    ) {
      let node;
      const nodes = this.body.nodes;
      const nodeIndices = this.physicsBody.physicsNodeIndices;
      const nodeCount = nodeIndices.length;

      // create the tree
      const barnesHutTree = this._formBarnesHutTree(nodes, nodeIndices);

      // for debugging
      this.barnesHutTree = barnesHutTree;

      // place the nodes one by one recursively
      for (let i = 0; i < nodeCount; i++) {
        node = nodes[nodeIndices[i]];
        if (node.options.mass > 0) {
          // starting with root is irrelevant, it never passes the BarnesHutSolver condition
          this._getForceContributions(barnesHutTree.root, node);
        }
      }
    }
  }

  /**
   * @param {object} parentBranch
   * @param {Node} node
   * @private
   */
  _getForceContributions(parentBranch, node) {
    this._getForceContribution(parentBranch.children.NW, node);
    this._getForceContribution(parentBranch.children.NE, node);
    this._getForceContribution(parentBranch.children.SW, node);
    this._getForceContribution(parentBranch.children.SE, node);
  }

  /**
   * This function traverses the barnesHutTree. It checks when it can approximate distant nodes with their center of mass.
   * If a region contains a single node, we check if it is not itself, then we apply the force.
   *
   * @param {object} parentBranch
   * @param {Node} node
   * @private
   */
  _getForceContribution(parentBranch, node) {
    // we get no force contribution from an empty region
    if (parentBranch.childrenCount > 0) {
      // get the distance from the center of mass to the node.
      const dx = parentBranch.centerOfMass.x - node.x;
      const dy = parentBranch.centerOfMass.y - node.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // BarnesHutSolver condition
      // original condition : s/d < theta = passed  ===  d/s > 1/theta = passed
      // calcSize = 1/s --> d * 1/s > 1/theta = passed
      if (distance * parentBranch.calcSize > this.thetaInversed) {
        this._calculateForces(distance, dx, dy, node, parentBranch);
      } else {
        // Did not pass the condition, go into children if available
        if (parentBranch.childrenCount === 4) {
          this._getForceContributions(parentBranch, node);
        } else {
          // parentBranch must have only one node, if it was empty we wouldnt be here
          if (parentBranch.children.data.id != node.id) {
            // if it is not self
            this._calculateForces(distance, dx, dy, node, parentBranch);
          }
        }
      }
    }
  }

  /**
   * Calculate the forces based on the distance.
   *
   * @param {number} distance
   * @param {number} dx
   * @param {number} dy
   * @param {Node} node
   * @param {object} parentBranch
   * @private
   */
  _calculateForces(distance, dx, dy, node, parentBranch) {
    if (distance === 0) {
      distance = 0.1;
      dx = distance;
    }

    if (this.overlapAvoidanceFactor < 1 && node.shape.radius) {
      distance = Math.max(
        0.1 + this.overlapAvoidanceFactor * node.shape.radius,
        distance - node.shape.radius
      );
    }

    // the dividing by the distance cubed instead of squared allows us to get the fx and fy components without sines and cosines
    // it is shorthand for gravityforce with distance squared and fx = dx/distance * gravityForce
    const gravityForce =
      (this.options.gravitationalConstant *
        parentBranch.mass *
        node.options.mass) /
      Math.pow(distance, 3);
    const fx = dx * gravityForce;
    const fy = dy * gravityForce;

    this.physicsBody.forces[node.id].x += fx;
    this.physicsBody.forces[node.id].y += fy;
  }

  /**
   * This function constructs the barnesHut tree recursively. It creates the root, splits it and starts placing the nodes.
   *
   * @param {Array.<Node>} nodes
   * @param {Array.<number>} nodeIndices
   * @returns {{root: {centerOfMass: {x: number, y: number}, mass: number, range: {minX: number, maxX: number, minY: number, maxY: number}, size: number, calcSize: number, children: {data: null}, maxWidth: number, level: number, childrenCount: number}}} BarnesHutTree
   * @private
   */
  _formBarnesHutTree(nodes, nodeIndices) {
    let node;
    const nodeCount = nodeIndices.length;

    let minX = nodes[nodeIndices[0]].x;
    let minY = nodes[nodeIndices[0]].y;
    let maxX = nodes[nodeIndices[0]].x;
    let maxY = nodes[nodeIndices[0]].y;

    // get the range of the nodes
    for (let i = 1; i < nodeCount; i++) {
      const node = nodes[nodeIndices[i]];
      const x = node.x;
      const y = node.y;
      if (node.options.mass > 0) {
        if (x < minX) {
          minX = x;
        }
        if (x > maxX) {
          maxX = x;
        }
        if (y < minY) {
          minY = y;
        }
        if (y > maxY) {
          maxY = y;
        }
      }
    }
    // make the range a square
    const sizeDiff = Math.abs(maxX - minX) - Math.abs(maxY - minY); // difference between X and Y
    if (sizeDiff > 0) {
      minY -= 0.5 * sizeDiff;
      maxY += 0.5 * sizeDiff;
    } // xSize > ySize
    else {
      minX += 0.5 * sizeDiff;
      maxX -= 0.5 * sizeDiff;
    } // xSize < ySize

    const minimumTreeSize = 1e-5;
    const rootSize = Math.max(minimumTreeSize, Math.abs(maxX - minX));
    const halfRootSize = 0.5 * rootSize;
    const centerX = 0.5 * (minX + maxX),
      centerY = 0.5 * (minY + maxY);

    // construct the barnesHutTree
    const barnesHutTree = {
      root: {
        centerOfMass: { x: 0, y: 0 },
        mass: 0,
        range: {
          minX: centerX - halfRootSize,
          maxX: centerX + halfRootSize,
          minY: centerY - halfRootSize,
          maxY: centerY + halfRootSize,
        },
        size: rootSize,
        calcSize: 1 / rootSize,
        children: { data: null },
        maxWidth: 0,
        level: 0,
        childrenCount: 4,
      },
    };
    this._splitBranch(barnesHutTree.root);

    // place the nodes one by one recursively
    for (let i = 0; i < nodeCount; i++) {
      node = nodes[nodeIndices[i]];
      if (node.options.mass > 0) {
        this._placeInTree(barnesHutTree.root, node);
      }
    }

    // make global
    return barnesHutTree;
  }

  /**
   * this updates the mass of a branch. this is increased by adding a node.
   *
   * @param {object} parentBranch
   * @param {Node} node
   * @private
   */
  _updateBranchMass(parentBranch, node) {
    const centerOfMass = parentBranch.centerOfMass;
    const totalMass = parentBranch.mass + node.options.mass;
    const totalMassInv = 1 / totalMass;

    centerOfMass.x =
      centerOfMass.x * parentBranch.mass + node.x * node.options.mass;
    centerOfMass.x *= totalMassInv;

    centerOfMass.y =
      centerOfMass.y * parentBranch.mass + node.y * node.options.mass;
    centerOfMass.y *= totalMassInv;

    parentBranch.mass = totalMass;
    const biggestSize = Math.max(
      Math.max(node.height, node.radius),
      node.width
    );
    parentBranch.maxWidth =
      parentBranch.maxWidth < biggestSize ? biggestSize : parentBranch.maxWidth;
  }

  /**
   * determine in which branch the node will be placed.
   *
   * @param {object} parentBranch
   * @param {Node} node
   * @param {boolean} skipMassUpdate
   * @private
   */
  _placeInTree(parentBranch, node, skipMassUpdate) {
    if (skipMassUpdate != true || skipMassUpdate === undefined) {
      // update the mass of the branch.
      this._updateBranchMass(parentBranch, node);
    }

    const range = parentBranch.children.NW.range;
    let region;
    if (range.maxX > node.x) {
      // in NW or SW
      if (range.maxY > node.y) {
        region = "NW";
      } else {
        region = "SW";
      }
    } else {
      // in NE or SE
      if (range.maxY > node.y) {
        region = "NE";
      } else {
        region = "SE";
      }
    }

    this._placeInRegion(parentBranch, node, region);
  }

  /**
   * actually place the node in a region (or branch)
   *
   * @param {object} parentBranch
   * @param {Node} node
   * @param {'NW'| 'NE' | 'SW' | 'SE'} region
   * @private
   */
  _placeInRegion(parentBranch, node, region) {
    const children = parentBranch.children[region];

    switch (children.childrenCount) {
      case 0: // place node here
        children.children.data = node;
        children.childrenCount = 1;
        this._updateBranchMass(children, node);
        break;
      case 1: // convert into children
        // if there are two nodes exactly overlapping (on init, on opening of cluster etc.)
        // we move one node a little bit and we do not put it in the tree.
        if (
          children.children.data.x === node.x &&
          children.children.data.y === node.y
        ) {
          node.x += this._rng();
          node.y += this._rng();
        } else {
          this._splitBranch(children);
          this._placeInTree(children, node);
        }
        break;
      case 4: // place in branch
        this._placeInTree(children, node);
        break;
    }
  }

  /**
   * this function splits a branch into 4 sub branches. If the branch contained a node, we place it in the subbranch
   * after the split is complete.
   *
   * @param {object} parentBranch
   * @private
   */
  _splitBranch(parentBranch) {
    // if the branch is shaded with a node, replace the node in the new subset.
    let containedNode = null;
    if (parentBranch.childrenCount === 1) {
      containedNode = parentBranch.children.data;
      parentBranch.mass = 0;
      parentBranch.centerOfMass.x = 0;
      parentBranch.centerOfMass.y = 0;
    }
    parentBranch.childrenCount = 4;
    parentBranch.children.data = null;
    this._insertRegion(parentBranch, "NW");
    this._insertRegion(parentBranch, "NE");
    this._insertRegion(parentBranch, "SW");
    this._insertRegion(parentBranch, "SE");

    if (containedNode != null) {
      this._placeInTree(parentBranch, containedNode);
    }
  }

  /**
   * This function subdivides the region into four new segments.
   * Specifically, this inserts a single new segment.
   * It fills the children section of the parentBranch
   *
   * @param {object} parentBranch
   * @param {'NW'| 'NE' | 'SW' | 'SE'} region
   * @private
   */
  _insertRegion(parentBranch, region) {
    let minX, maxX, minY, maxY;
    const childSize = 0.5 * parentBranch.size;
    switch (region) {
      case "NW":
        minX = parentBranch.range.minX;
        maxX = parentBranch.range.minX + childSize;
        minY = parentBranch.range.minY;
        maxY = parentBranch.range.minY + childSize;
        break;
      case "NE":
        minX = parentBranch.range.minX + childSize;
        maxX = parentBranch.range.maxX;
        minY = parentBranch.range.minY;
        maxY = parentBranch.range.minY + childSize;
        break;
      case "SW":
        minX = parentBranch.range.minX;
        maxX = parentBranch.range.minX + childSize;
        minY = parentBranch.range.minY + childSize;
        maxY = parentBranch.range.maxY;
        break;
      case "SE":
        minX = parentBranch.range.minX + childSize;
        maxX = parentBranch.range.maxX;
        minY = parentBranch.range.minY + childSize;
        maxY = parentBranch.range.maxY;
        break;
    }

    parentBranch.children[region] = {
      centerOfMass: { x: 0, y: 0 },
      mass: 0,
      range: { minX: minX, maxX: maxX, minY: minY, maxY: maxY },
      size: 0.5 * parentBranch.size,
      calcSize: 2 * parentBranch.calcSize,
      children: { data: null },
      maxWidth: 0,
      level: parentBranch.level + 1,
      childrenCount: 0,
    };
  }

  //---------------------------  DEBUGGING BELOW  ---------------------------//

  /**
   * This function is for debugging purposed, it draws the tree.
   *
   * @param {CanvasRenderingContext2D} ctx
   * @param {string} color
   * @private
   */
  _debug(ctx, color) {
    if (this.barnesHutTree !== undefined) {
      ctx.lineWidth = 1;

      this._drawBranch(this.barnesHutTree.root, ctx, color);
    }
  }

  /**
   * This function is for debugging purposes. It draws the branches recursively.
   *
   * @param {object} branch
   * @param {CanvasRenderingContext2D} ctx
   * @param {string} color
   * @private
   */
  _drawBranch(branch, ctx, color) {
    if (color === undefined) {
      color = "#FF0000";
    }

    if (branch.childrenCount === 4) {
      this._drawBranch(branch.children.NW, ctx);
      this._drawBranch(branch.children.NE, ctx);
      this._drawBranch(branch.children.SE, ctx);
      this._drawBranch(branch.children.SW, ctx);
    }
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(branch.range.minX, branch.range.minY);
    ctx.lineTo(branch.range.maxX, branch.range.minY);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(branch.range.maxX, branch.range.minY);
    ctx.lineTo(branch.range.maxX, branch.range.maxY);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(branch.range.maxX, branch.range.maxY);
    ctx.lineTo(branch.range.minX, branch.range.maxY);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(branch.range.minX, branch.range.maxY);
    ctx.lineTo(branch.range.minX, branch.range.minY);
    ctx.stroke();

    /*
     if (branch.mass > 0) {
     ctx.circle(branch.centerOfMass.x, branch.centerOfMass.y, 3*branch.mass);
     ctx.stroke();
     }
     */
  }
}

export default BarnesHutSolver;
