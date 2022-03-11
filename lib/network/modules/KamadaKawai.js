// distance finding algorithm
import FloydWarshall from "./components/algorithms/FloydWarshall.js";

/**
 * KamadaKawai positions the nodes initially based on
 *
 * "AN ALGORITHM FOR DRAWING GENERAL UNDIRECTED GRAPHS"
 * -- Tomihisa KAMADA and Satoru KAWAI in 1989
 *
 * Possible optimizations in the distance calculation can be implemented.
 */
class KamadaKawai {
  /**
   * @param {object} body
   * @param {number} edgeLength
   * @param {number} edgeStrength
   */
  constructor(body, edgeLength, edgeStrength) {
    this.body = body;
    this.springLength = edgeLength;
    this.springConstant = edgeStrength;
    this.distanceSolver = new FloydWarshall();
  }

  /**
   * Not sure if needed but can be used to update the spring length and spring constant
   *
   * @param {object} options
   */
  setOptions(options) {
    if (options) {
      if (options.springLength) {
        this.springLength = options.springLength;
      }
      if (options.springConstant) {
        this.springConstant = options.springConstant;
      }
    }
  }

  /**
   * Position the system
   *
   * @param {Array.<Node>} nodesArray
   * @param {Array.<vis.Edge>} edgesArray
   * @param {boolean} [ignoreClusters=false]
   */
  solve(nodesArray, edgesArray, ignoreClusters = false) {
    // get distance matrix
    const D_matrix = this.distanceSolver.getDistances(
      this.body,
      nodesArray,
      edgesArray
    ); // distance matrix

    // get the L Matrix
    this._createL_matrix(D_matrix);

    // get the K Matrix
    this._createK_matrix(D_matrix);

    // initial E Matrix
    this._createE_matrix();

    // calculate positions
    const threshold = 0.01;
    const innerThreshold = 1;
    let iterations = 0;
    const maxIterations = Math.max(
      1000,
      Math.min(10 * this.body.nodeIndices.length, 6000)
    );
    const maxInnerIterations = 5;

    let maxEnergy = 1e9;
    let highE_nodeId = 0,
      dE_dx = 0,
      dE_dy = 0,
      delta_m = 0,
      subIterations = 0;

    while (maxEnergy > threshold && iterations < maxIterations) {
      iterations += 1;
      [highE_nodeId, maxEnergy, dE_dx, dE_dy] =
        this._getHighestEnergyNode(ignoreClusters);
      delta_m = maxEnergy;
      subIterations = 0;
      while (delta_m > innerThreshold && subIterations < maxInnerIterations) {
        subIterations += 1;
        this._moveNode(highE_nodeId, dE_dx, dE_dy);
        [delta_m, dE_dx, dE_dy] = this._getEnergy(highE_nodeId);
      }
    }
  }

  /**
   * get the node with the highest energy
   *
   * @param {boolean} ignoreClusters
   * @returns {number[]}
   * @private
   */
  _getHighestEnergyNode(ignoreClusters) {
    const nodesArray = this.body.nodeIndices;
    const nodes = this.body.nodes;
    let maxEnergy = 0;
    let maxEnergyNodeId = nodesArray[0];
    let dE_dx_max = 0,
      dE_dy_max = 0;

    for (let nodeIdx = 0; nodeIdx < nodesArray.length; nodeIdx++) {
      const m = nodesArray[nodeIdx];
      // by not evaluating nodes with predefined positions we should only move nodes that have no positions.
      if (
        nodes[m].predefinedPosition !== true ||
        (nodes[m].isCluster === true && ignoreClusters === true) ||
        nodes[m].options.fixed.x !== true ||
        nodes[m].options.fixed.y !== true
      ) {
        const [delta_m, dE_dx, dE_dy] = this._getEnergy(m);
        if (maxEnergy < delta_m) {
          maxEnergy = delta_m;
          maxEnergyNodeId = m;
          dE_dx_max = dE_dx;
          dE_dy_max = dE_dy;
        }
      }
    }

    return [maxEnergyNodeId, maxEnergy, dE_dx_max, dE_dy_max];
  }

  /**
   * calculate the energy of a single node
   *
   * @param {Node.id} m
   * @returns {number[]}
   * @private
   */
  _getEnergy(m) {
    const [dE_dx, dE_dy] = this.E_sums[m];
    const delta_m = Math.sqrt(dE_dx ** 2 + dE_dy ** 2);
    return [delta_m, dE_dx, dE_dy];
  }

  /**
   * move the node based on it's energy
   * the dx and dy are calculated from the linear system proposed by Kamada and Kawai
   *
   * @param {number} m
   * @param {number} dE_dx
   * @param {number} dE_dy
   * @private
   */
  _moveNode(m, dE_dx, dE_dy) {
    const nodesArray = this.body.nodeIndices;
    const nodes = this.body.nodes;
    let d2E_dx2 = 0;
    let d2E_dxdy = 0;
    let d2E_dy2 = 0;

    const x_m = nodes[m].x;
    const y_m = nodes[m].y;
    const km = this.K_matrix[m];
    const lm = this.L_matrix[m];

    for (let iIdx = 0; iIdx < nodesArray.length; iIdx++) {
      const i = nodesArray[iIdx];
      if (i !== m) {
        const x_i = nodes[i].x;
        const y_i = nodes[i].y;
        const kmat = km[i];
        const lmat = lm[i];
        const denominator = 1.0 / ((x_m - x_i) ** 2 + (y_m - y_i) ** 2) ** 1.5;
        d2E_dx2 += kmat * (1 - lmat * (y_m - y_i) ** 2 * denominator);
        d2E_dxdy += kmat * (lmat * (x_m - x_i) * (y_m - y_i) * denominator);
        d2E_dy2 += kmat * (1 - lmat * (x_m - x_i) ** 2 * denominator);
      }
    }
    // make the variable names easier to make the solving of the linear system easier to read
    const A = d2E_dx2,
      B = d2E_dxdy,
      C = dE_dx,
      D = d2E_dy2,
      E = dE_dy;

    // solve the linear system for dx and dy
    const dy = (C / A + E / B) / (B / A - D / B);
    const dx = -(B * dy + C) / A;

    // move the node
    nodes[m].x += dx;
    nodes[m].y += dy;

    // Recalculate E_matrix (should be incremental)
    this._updateE_matrix(m);
  }

  /**
   * Create the L matrix: edge length times shortest path
   *
   * @param {object} D_matrix
   * @private
   */
  _createL_matrix(D_matrix) {
    const nodesArray = this.body.nodeIndices;
    const edgeLength = this.springLength;

    this.L_matrix = [];
    for (let i = 0; i < nodesArray.length; i++) {
      this.L_matrix[nodesArray[i]] = {};
      for (let j = 0; j < nodesArray.length; j++) {
        this.L_matrix[nodesArray[i]][nodesArray[j]] =
          edgeLength * D_matrix[nodesArray[i]][nodesArray[j]];
      }
    }
  }

  /**
   * Create the K matrix: spring constants times shortest path
   *
   * @param {object} D_matrix
   * @private
   */
  _createK_matrix(D_matrix) {
    const nodesArray = this.body.nodeIndices;
    const edgeStrength = this.springConstant;

    this.K_matrix = [];
    for (let i = 0; i < nodesArray.length; i++) {
      this.K_matrix[nodesArray[i]] = {};
      for (let j = 0; j < nodesArray.length; j++) {
        this.K_matrix[nodesArray[i]][nodesArray[j]] =
          edgeStrength * D_matrix[nodesArray[i]][nodesArray[j]] ** -2;
      }
    }
  }

  /**
   *  Create matrix with all energies between nodes
   *
   *  @private
   */
  _createE_matrix() {
    const nodesArray = this.body.nodeIndices;
    const nodes = this.body.nodes;
    this.E_matrix = {};
    this.E_sums = {};
    for (let mIdx = 0; mIdx < nodesArray.length; mIdx++) {
      this.E_matrix[nodesArray[mIdx]] = [];
    }
    for (let mIdx = 0; mIdx < nodesArray.length; mIdx++) {
      const m = nodesArray[mIdx];
      const x_m = nodes[m].x;
      const y_m = nodes[m].y;
      let dE_dx = 0;
      let dE_dy = 0;
      for (let iIdx = mIdx; iIdx < nodesArray.length; iIdx++) {
        const i = nodesArray[iIdx];
        if (i !== m) {
          const x_i = nodes[i].x;
          const y_i = nodes[i].y;
          const denominator =
            1.0 / Math.sqrt((x_m - x_i) ** 2 + (y_m - y_i) ** 2);
          this.E_matrix[m][iIdx] = [
            this.K_matrix[m][i] *
              (x_m - x_i - this.L_matrix[m][i] * (x_m - x_i) * denominator),
            this.K_matrix[m][i] *
              (y_m - y_i - this.L_matrix[m][i] * (y_m - y_i) * denominator),
          ];
          this.E_matrix[i][mIdx] = this.E_matrix[m][iIdx];
          dE_dx += this.E_matrix[m][iIdx][0];
          dE_dy += this.E_matrix[m][iIdx][1];
        }
      }
      //Store sum
      this.E_sums[m] = [dE_dx, dE_dy];
    }
  }

  /**
   * Update method, just doing single column (rows are auto-updated) (update all sums)
   *
   * @param {number} m
   * @private
   */
  _updateE_matrix(m) {
    const nodesArray = this.body.nodeIndices;
    const nodes = this.body.nodes;
    const colm = this.E_matrix[m];
    const kcolm = this.K_matrix[m];
    const lcolm = this.L_matrix[m];
    const x_m = nodes[m].x;
    const y_m = nodes[m].y;
    let dE_dx = 0;
    let dE_dy = 0;
    for (let iIdx = 0; iIdx < nodesArray.length; iIdx++) {
      const i = nodesArray[iIdx];
      if (i !== m) {
        //Keep old energy value for sum modification below
        const cell = colm[iIdx];
        const oldDx = cell[0];
        const oldDy = cell[1];

        //Calc new energy:
        const x_i = nodes[i].x;
        const y_i = nodes[i].y;
        const denominator =
          1.0 / Math.sqrt((x_m - x_i) ** 2 + (y_m - y_i) ** 2);
        const dx =
          kcolm[i] * (x_m - x_i - lcolm[i] * (x_m - x_i) * denominator);
        const dy =
          kcolm[i] * (y_m - y_i - lcolm[i] * (y_m - y_i) * denominator);
        colm[iIdx] = [dx, dy];
        dE_dx += dx;
        dE_dy += dy;

        //add new energy to sum of each column
        const sum = this.E_sums[i];
        sum[0] += dx - oldDx;
        sum[1] += dy - oldDy;
      }
    }
    //Store sum at -1 index
    this.E_sums[m] = [dE_dx, dE_dy];
  }
}

export default KamadaKawai;
