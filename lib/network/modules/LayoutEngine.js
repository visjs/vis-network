/**
 * There's a mix-up with terms in the code. Following are the formal definitions:
 *
 *   tree   - a strict hierarchical network, i.e. every node has at most one parent
 *   forest - a collection of trees. These distinct trees are thus not connected.
 *
 * So:
 * - in a network that is not a tree, there exist nodes with multiple parents.
 * - a network consisting of unconnected sub-networks, of which at least one
 *   is not a tree, is not a forest.
 *
 * In the code, the definitions are:
 *
 *   tree   - any disconnected sub-network, strict hierarchical or not.
 *   forest - a bunch of these sub-networks
 *
 * The difference between tree and not-tree is important in the code, notably within
 * to the block-shifting algorithm. The algorithm assumes formal trees and fails
 * for not-trees, often in a spectacular manner (search for 'exploding network' in the issues).
 *
 * In order to distinguish the definitions in the following code, the adjective 'formal' is
 * used. If 'formal' is absent, you must assume the non-formal definition.
 *
 * ----------------------------------------------------------------------------------
 * NOTES
 * =====
 *
 * A hierarchical layout is a different thing from a hierarchical network.
 * The layout is a way to arrange the nodes in the view; this can be done
 * on non-hierarchical networks as well. The converse is also possible.
 */
"use strict";
import {
  Alea,
  deepExtend,
  forEach,
  mergeOptions,
  selectiveDeepExtend,
} from "vis-util/esnext";
import NetworkUtil from "../NetworkUtil";
import {
  HorizontalStrategy,
  VerticalStrategy,
} from "./components/DirectionStrategy.js";
import {
  fillLevelsByDirectionLeaves,
  fillLevelsByDirectionRoots,
} from "./layout-engine";

/**
 * Container for derived data on current network, relating to hierarchy.
 *
 * @private
 */
class HierarchicalStatus {
  /**
   * @ignore
   */
  constructor() {
    this.childrenReference = {}; // child id's per node id
    this.parentReference = {}; // parent id's per node id
    this.trees = {}; // tree id per node id; i.e. to which tree does given node id belong

    this.distributionOrdering = {}; // The nodes per level, in the display order
    this.levels = {}; // hierarchy level per node id
    this.distributionIndex = {}; // The position of the node in the level sorting order, per node id.

    this.isTree = false; // True if current network is a formal tree
    this.treeIndex = -1; // Highest tree id in current network.
  }

  /**
   * Add the relation between given nodes to the current state.
   *
   * @param {Node.id} parentNodeId
   * @param {Node.id} childNodeId
   */
  addRelation(parentNodeId, childNodeId) {
    if (this.childrenReference[parentNodeId] === undefined) {
      this.childrenReference[parentNodeId] = [];
    }
    this.childrenReference[parentNodeId].push(childNodeId);

    if (this.parentReference[childNodeId] === undefined) {
      this.parentReference[childNodeId] = [];
    }
    this.parentReference[childNodeId].push(parentNodeId);
  }

  /**
   * Check if the current state is for a formal tree or formal forest.
   *
   * This is the case if every node has at most one parent.
   *
   * Pre: parentReference init'ed properly for current network
   */
  checkIfTree() {
    for (const i in this.parentReference) {
      if (this.parentReference[i].length > 1) {
        this.isTree = false;
        return;
      }
    }

    this.isTree = true;
  }

  /**
   * Return the number of separate trees in the current network.
   *
   * @returns {number}
   */
  numTrees() {
    return this.treeIndex + 1; // This assumes the indexes are assigned consecitively
  }

  /**
   * Assign a tree id to a node
   *
   * @param {Node} node
   * @param {string|number} treeId
   */
  setTreeIndex(node, treeId) {
    if (treeId === undefined) return; // Don't bother

    if (this.trees[node.id] === undefined) {
      this.trees[node.id] = treeId;
      this.treeIndex = Math.max(treeId, this.treeIndex);
    }
  }

  /**
   * Ensure level for given id is defined.
   *
   * Sets level to zero for given node id if not already present
   *
   * @param {Node.id} nodeId
   */
  ensureLevel(nodeId) {
    if (this.levels[nodeId] === undefined) {
      this.levels[nodeId] = 0;
    }
  }

  /**
   * get the maximum level of a branch.
   *
   * TODO: Never entered; find a test case to test this!
   *
   * @param {Node.id} nodeId
   * @returns {number}
   */
  getMaxLevel(nodeId) {
    const accumulator = {};

    const _getMaxLevel = (nodeId) => {
      if (accumulator[nodeId] !== undefined) {
        return accumulator[nodeId];
      }
      let level = this.levels[nodeId];
      if (this.childrenReference[nodeId]) {
        const children = this.childrenReference[nodeId];
        if (children.length > 0) {
          for (let i = 0; i < children.length; i++) {
            level = Math.max(level, _getMaxLevel(children[i]));
          }
        }
      }
      accumulator[nodeId] = level;
      return level;
    };

    return _getMaxLevel(nodeId);
  }

  /**
   *
   * @param {Node} nodeA
   * @param {Node} nodeB
   */
  levelDownstream(nodeA, nodeB) {
    if (this.levels[nodeB.id] === undefined) {
      // set initial level
      if (this.levels[nodeA.id] === undefined) {
        this.levels[nodeA.id] = 0;
      }
      // set level
      this.levels[nodeB.id] = this.levels[nodeA.id] + 1;
    }
  }

  /**
   * Small util method to set the minimum levels of the nodes to zero.
   *
   * @param {Array.<Node>} nodes
   */
  setMinLevelToZero(nodes) {
    let minLevel = 1e9;
    // get the minimum level
    for (const nodeId in nodes) {
      if (Object.prototype.hasOwnProperty.call(nodes, nodeId)) {
        if (this.levels[nodeId] !== undefined) {
          minLevel = Math.min(this.levels[nodeId], minLevel);
        }
      }
    }

    // subtract the minimum from the set so we have a range starting from 0
    for (const nodeId in nodes) {
      if (Object.prototype.hasOwnProperty.call(nodes, nodeId)) {
        if (this.levels[nodeId] !== undefined) {
          this.levels[nodeId] -= minLevel;
        }
      }
    }
  }

  /**
   * Get the min and max xy-coordinates of a given tree
   *
   * @param {Array.<Node>} nodes
   * @param {number} index
   * @returns {{min_x: number, max_x: number, min_y: number, max_y: number}}
   */
  getTreeSize(nodes, index) {
    let min_x = 1e9;
    let max_x = -1e9;
    let min_y = 1e9;
    let max_y = -1e9;

    for (const nodeId in this.trees) {
      if (Object.prototype.hasOwnProperty.call(this.trees, nodeId)) {
        if (this.trees[nodeId] === index) {
          const node = nodes[nodeId];
          min_x = Math.min(node.x, min_x);
          max_x = Math.max(node.x, max_x);
          min_y = Math.min(node.y, min_y);
          max_y = Math.max(node.y, max_y);
        }
      }
    }

    return {
      min_x: min_x,
      max_x: max_x,
      min_y: min_y,
      max_y: max_y,
    };
  }

  /**
   * Check if two nodes have the same parent(s)
   *
   * @param {Node} node1
   * @param {Node} node2
   * @returns {boolean} true if the two nodes have a same ancestor node, false otherwise
   */
  hasSameParent(node1, node2) {
    const parents1 = this.parentReference[node1.id];
    const parents2 = this.parentReference[node2.id];
    if (parents1 === undefined || parents2 === undefined) {
      return false;
    }

    for (let i = 0; i < parents1.length; i++) {
      for (let j = 0; j < parents2.length; j++) {
        if (parents1[i] == parents2[j]) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Check if two nodes are in the same tree.
   *
   * @param {Node} node1
   * @param {Node} node2
   * @returns {boolean} true if this is so, false otherwise
   */
  inSameSubNetwork(node1, node2) {
    return this.trees[node1.id] === this.trees[node2.id];
  }

  /**
   * Get a list of the distinct levels in the current network
   *
   * @returns {Array}
   */
  getLevels() {
    return Object.keys(this.distributionOrdering);
  }

  /**
   * Add a node to the ordering per level
   *
   * @param {Node} node
   * @param {number} level
   */
  addToOrdering(node, level) {
    if (this.distributionOrdering[level] === undefined) {
      this.distributionOrdering[level] = [];
    }

    let isPresent = false;
    const curLevel = this.distributionOrdering[level];
    for (const n in curLevel) {
      //if (curLevel[n].id === node.id) {
      if (curLevel[n] === node) {
        isPresent = true;
        break;
      }
    }

    if (!isPresent) {
      this.distributionOrdering[level].push(node);
      this.distributionIndex[node.id] =
        this.distributionOrdering[level].length - 1;
    }
  }
}

/**
 * The Layout Engine
 */
class LayoutEngine {
  /**
   * @param {object} body
   */
  constructor(body) {
    this.body = body;

    // Make sure there always is some RNG because the setOptions method won't
    // set it unless there's a seed for it.
    this._resetRNG(Math.random() + ":" + Date.now());

    this.setPhysics = false;
    this.options = {};
    this.optionsBackup = { physics: {} };

    this.defaultOptions = {
      randomSeed: undefined,
      improvedLayout: true,
      clusterThreshold: 150,
      hierarchical: {
        enabled: false,
        levelSeparation: 150,
        nodeSpacing: 100,
        treeSpacing: 200,
        blockShifting: true,
        edgeMinimization: true,
        parentCentralization: true,
        direction: "UD", // UD, DU, LR, RL
        sortMethod: "hubsize", // hubsize, directed
      },
    };
    Object.assign(this.options, this.defaultOptions);
    this.bindEventListeners();
  }

  /**
   * Binds event listeners
   */
  bindEventListeners() {
    this.body.emitter.on("_dataChanged", () => {
      this.setupHierarchicalLayout();
    });
    this.body.emitter.on("_dataLoaded", () => {
      this.layoutNetwork();
    });
    this.body.emitter.on("_resetHierarchicalLayout", () => {
      this.setupHierarchicalLayout();
    });
    this.body.emitter.on("_adjustEdgesForHierarchicalLayout", () => {
      if (this.options.hierarchical.enabled !== true) {
        return;
      }
      // get the type of static smooth curve in case it is required
      const type = this.direction.curveType();

      // force all edges into static smooth curves.
      this.body.emitter.emit("_forceDisableDynamicCurves", type, false);
    });
  }

  /**
   *
   * @param {object} options
   * @param {object} allOptions
   * @returns {object}
   */
  setOptions(options, allOptions) {
    if (options !== undefined) {
      const hierarchical = this.options.hierarchical;
      const prevHierarchicalState = hierarchical.enabled;
      selectiveDeepExtend(
        ["randomSeed", "improvedLayout", "clusterThreshold"],
        this.options,
        options
      );
      mergeOptions(this.options, options, "hierarchical");

      if (options.randomSeed !== undefined) {
        this._resetRNG(options.randomSeed);
      }

      if (hierarchical.enabled === true) {
        if (prevHierarchicalState === true) {
          // refresh the overridden options for nodes and edges.
          this.body.emitter.emit("refresh", true);
        }

        // make sure the level separation is the right way up
        if (
          hierarchical.direction === "RL" ||
          hierarchical.direction === "DU"
        ) {
          if (hierarchical.levelSeparation > 0) {
            hierarchical.levelSeparation *= -1;
          }
        } else {
          if (hierarchical.levelSeparation < 0) {
            hierarchical.levelSeparation *= -1;
          }
        }

        this.setDirectionStrategy();

        this.body.emitter.emit("_resetHierarchicalLayout");
        // because the hierarchical system needs it's own physics and smooth curve settings,
        // we adapt the other options if needed.
        return this.adaptAllOptionsForHierarchicalLayout(allOptions);
      } else {
        if (prevHierarchicalState === true) {
          // refresh the overridden options for nodes and edges.
          this.body.emitter.emit("refresh");
          return deepExtend(allOptions, this.optionsBackup);
        }
      }
    }
    return allOptions;
  }

  /**
   * Reset the random number generator with given seed.
   *
   * @param {any} seed - The seed that will be forwarded the the RNG.
   */
  _resetRNG(seed) {
    this.initialRandomSeed = seed;
    this._rng = Alea(this.initialRandomSeed);
  }

  /**
   *
   * @param {object} allOptions
   * @returns {object}
   */
  adaptAllOptionsForHierarchicalLayout(allOptions) {
    if (this.options.hierarchical.enabled === true) {
      const backupPhysics = this.optionsBackup.physics;

      // set the physics
      if (allOptions.physics === undefined || allOptions.physics === true) {
        allOptions.physics = {
          enabled:
            backupPhysics.enabled === undefined ? true : backupPhysics.enabled,
          solver: "hierarchicalRepulsion",
        };
        backupPhysics.enabled =
          backupPhysics.enabled === undefined ? true : backupPhysics.enabled;
        backupPhysics.solver = backupPhysics.solver || "barnesHut";
      } else if (typeof allOptions.physics === "object") {
        backupPhysics.enabled =
          allOptions.physics.enabled === undefined
            ? true
            : allOptions.physics.enabled;
        backupPhysics.solver = allOptions.physics.solver || "barnesHut";
        allOptions.physics.solver = "hierarchicalRepulsion";
      } else if (allOptions.physics !== false) {
        backupPhysics.solver = "barnesHut";
        allOptions.physics = { solver: "hierarchicalRepulsion" };
      }

      // get the type of static smooth curve in case it is required
      let type = this.direction.curveType();

      // disable smooth curves if nothing is defined. If smooth curves have been turned on,
      // turn them into static smooth curves.
      if (allOptions.edges === undefined) {
        this.optionsBackup.edges = {
          smooth: { enabled: true, type: "dynamic" },
        };
        allOptions.edges = { smooth: false };
      } else if (allOptions.edges.smooth === undefined) {
        this.optionsBackup.edges = {
          smooth: { enabled: true, type: "dynamic" },
        };
        allOptions.edges.smooth = false;
      } else {
        if (typeof allOptions.edges.smooth === "boolean") {
          this.optionsBackup.edges = { smooth: allOptions.edges.smooth };
          allOptions.edges.smooth = {
            enabled: allOptions.edges.smooth,
            type: type,
          };
        } else {
          const smooth = allOptions.edges.smooth;

          // allow custom types except for dynamic
          if (smooth.type !== undefined && smooth.type !== "dynamic") {
            type = smooth.type;
          }

          // TODO: this is options merging; see if the standard routines can be used here.
          this.optionsBackup.edges = {
            smooth: {
              enabled: smooth.enabled === undefined ? true : smooth.enabled,
              type: smooth.type === undefined ? "dynamic" : smooth.type,
              roundness:
                smooth.roundness === undefined ? 0.5 : smooth.roundness,
              forceDirection:
                smooth.forceDirection === undefined
                  ? false
                  : smooth.forceDirection,
            },
          };

          // NOTE: Copying an object to self; this is basically setting defaults for undefined variables
          allOptions.edges.smooth = {
            enabled: smooth.enabled === undefined ? true : smooth.enabled,
            type: type,
            roundness: smooth.roundness === undefined ? 0.5 : smooth.roundness,
            forceDirection:
              smooth.forceDirection === undefined
                ? false
                : smooth.forceDirection,
          };
        }
      }

      // Force all edges into static smooth curves.
      // Only applies to edges that do not use the global options for smooth.
      this.body.emitter.emit("_forceDisableDynamicCurves", type);
    }

    return allOptions;
  }

  /**
   *
   * @param {Array.<Node>} nodesArray
   */
  positionInitially(nodesArray) {
    if (this.options.hierarchical.enabled !== true) {
      this._resetRNG(this.initialRandomSeed);
      const radius = nodesArray.length + 50;
      for (let i = 0; i < nodesArray.length; i++) {
        const node = nodesArray[i];
        const angle = 2 * Math.PI * this._rng();
        if (node.x === undefined) {
          node.x = radius * Math.cos(angle);
        }
        if (node.y === undefined) {
          node.y = radius * Math.sin(angle);
        }
      }
    }
  }

  /**
   * Use Kamada Kawai to position nodes. This is quite a heavy algorithm so if there are a lot of nodes we
   * cluster them first to reduce the amount.
   */
  layoutNetwork() {
    if (
      this.options.hierarchical.enabled !== true &&
      this.options.improvedLayout === true
    ) {
      const indices = this.body.nodeIndices;

      // first check if we should Kamada Kawai to layout. The threshold is if less than half of the visible
      // nodes have predefined positions we use this.
      let positionDefined = 0;
      for (let i = 0; i < indices.length; i++) {
        const node = this.body.nodes[indices[i]];
        if (node.predefinedPosition === true) {
          positionDefined += 1;
        }
      }

      // if less than half of the nodes have a predefined position we continue
      if (positionDefined < 0.5 * indices.length) {
        const MAX_LEVELS = 10;
        let level = 0;
        const clusterThreshold = this.options.clusterThreshold;

        //
        // Define the options for the hidden cluster nodes
        // These options don't propagate outside the clustering phase.
        //
        // Some options are explicitly disabled, because they may be set in group or default node options.
        // The clusters are never displayed, so most explicit settings here serve as performance optimizations.
        //
        // The explicit setting of 'shape' is to avoid `shape: 'image'`; images are not passed to the hidden
        // cluster nodes, leading to an exception on creation.
        //
        // All settings here are performance related, except when noted otherwise.
        //
        const clusterOptions = {
          clusterNodeProperties: {
            shape: "ellipse", // Bugfix: avoid type 'image', no images supplied
            label: "", // avoid label handling
            group: "", // avoid group handling
            font: { multi: false }, // avoid font propagation
          },
          clusterEdgeProperties: {
            label: "", // avoid label handling
            font: { multi: false }, // avoid font propagation
            smooth: {
              enabled: false, // avoid drawing penalty for complex edges
            },
          },
        };

        // if there are a lot of nodes, we cluster before we run the algorithm.
        // NOTE: this part fails to find clusters for large scale-free networks, which should
        //       be easily clusterable.
        // TODO: examine why this is so
        if (indices.length > clusterThreshold) {
          const startLength = indices.length;
          while (indices.length > clusterThreshold && level <= MAX_LEVELS) {
            //console.time("clustering")
            level += 1;
            const before = indices.length;
            // if there are many nodes we do a hubsize cluster
            if (level % 3 === 0) {
              this.body.modules.clustering.clusterBridges(clusterOptions);
            } else {
              this.body.modules.clustering.clusterOutliers(clusterOptions);
            }
            const after = indices.length;
            if (before == after && level % 3 !== 0) {
              this._declusterAll();
              this.body.emitter.emit("_layoutFailed");
              console.info(
                "This network could not be positioned by this version of the improved layout algorithm." +
                  " Please disable improvedLayout for better performance."
              );
              return;
            }
            //console.timeEnd("clustering")
            //console.log(before,level,after);
          }
          // increase the size of the edges
          this.body.modules.kamadaKawai.setOptions({
            springLength: Math.max(150, 2 * startLength),
          });
        }
        if (level > MAX_LEVELS) {
          console.info(
            "The clustering didn't succeed within the amount of interations allowed," +
              " progressing with partial result."
          );
        }

        // position the system for these nodes and edges
        this.body.modules.kamadaKawai.solve(
          indices,
          this.body.edgeIndices,
          true
        );

        // shift to center point
        this._shiftToCenter();

        // perturb the nodes a little bit to force the physics to kick in
        const offset = 70;
        for (let i = 0; i < indices.length; i++) {
          // Only perturb the nodes that aren't fixed
          const node = this.body.nodes[indices[i]];
          if (node.predefinedPosition === false) {
            node.x += (0.5 - this._rng()) * offset;
            node.y += (0.5 - this._rng()) * offset;
          }
        }

        // uncluster all clusters
        this._declusterAll();

        // reposition all bezier nodes.
        this.body.emitter.emit("_repositionBezierNodes");
      }
    }
  }

  /**
   * Move all the nodes towards to the center so gravitational pull wil not move the nodes away from view
   *
   * @private
   */
  _shiftToCenter() {
    const range = NetworkUtil.getRangeCore(
      this.body.nodes,
      this.body.nodeIndices
    );
    const center = NetworkUtil.findCenter(range);
    for (let i = 0; i < this.body.nodeIndices.length; i++) {
      const node = this.body.nodes[this.body.nodeIndices[i]];
      node.x -= center.x;
      node.y -= center.y;
    }
  }

  /**
   * Expands all clusters
   *
   * @private
   */
  _declusterAll() {
    let clustersPresent = true;
    while (clustersPresent === true) {
      clustersPresent = false;
      for (let i = 0; i < this.body.nodeIndices.length; i++) {
        if (this.body.nodes[this.body.nodeIndices[i]].isCluster === true) {
          clustersPresent = true;
          this.body.modules.clustering.openCluster(
            this.body.nodeIndices[i],
            {},
            false
          );
        }
      }
      if (clustersPresent === true) {
        this.body.emitter.emit("_dataChanged");
      }
    }
  }

  /**
   *
   * @returns {number|*}
   */
  getSeed() {
    return this.initialRandomSeed;
  }

  /**
   * This is the main function to layout the nodes in a hierarchical way.
   * It checks if the node details are supplied correctly
   *
   * @private
   */
  setupHierarchicalLayout() {
    if (
      this.options.hierarchical.enabled === true &&
      this.body.nodeIndices.length > 0
    ) {
      // get the size of the largest hubs and check if the user has defined a level for a node.
      let node, nodeId;
      let definedLevel = false;
      let undefinedLevel = false;
      this.lastNodeOnLevel = {};
      this.hierarchical = new HierarchicalStatus();

      for (nodeId in this.body.nodes) {
        if (Object.prototype.hasOwnProperty.call(this.body.nodes, nodeId)) {
          node = this.body.nodes[nodeId];
          if (node.options.level !== undefined) {
            definedLevel = true;
            this.hierarchical.levels[nodeId] = node.options.level;
          } else {
            undefinedLevel = true;
          }
        }
      }

      // if the user defined some levels but not all, alert and run without hierarchical layout
      if (undefinedLevel === true && definedLevel === true) {
        throw new Error(
          "To use the hierarchical layout, nodes require either no predefined levels" +
            " or levels have to be defined for all nodes."
        );
      } else {
        // define levels if undefined by the users. Based on hubsize.
        if (undefinedLevel === true) {
          const sortMethod = this.options.hierarchical.sortMethod;
          if (sortMethod === "hubsize") {
            this._determineLevelsByHubsize();
          } else if (sortMethod === "directed") {
            this._determineLevelsDirected();
          } else if (sortMethod === "custom") {
            this._determineLevelsCustomCallback();
          }
        }

        // fallback for cases where there are nodes but no edges
        for (const nodeId in this.body.nodes) {
          if (Object.prototype.hasOwnProperty.call(this.body.nodes, nodeId)) {
            this.hierarchical.ensureLevel(nodeId);
          }
        }
        // check the distribution of the nodes per level.
        const distribution = this._getDistribution();

        // get the parent children relations.
        this._generateMap();

        // place the nodes on the canvas.
        this._placeNodesByHierarchy(distribution);

        // condense the whitespace.
        this._condenseHierarchy();

        // shift to center so gravity does not have to do much
        this._shiftToCenter();
      }
    }
  }

  /**
   * @private
   */
  _condenseHierarchy() {
    // Global var in this scope to define when the movement has stopped.
    let stillShifting = false;
    const branches = {};
    // first we have some methods to help shifting trees around.
    // the main method to shift the trees
    const shiftTrees = () => {
      const treeSizes = getTreeSizes();
      let shiftBy = 0;
      for (let i = 0; i < treeSizes.length - 1; i++) {
        const diff = treeSizes[i].max - treeSizes[i + 1].min;
        shiftBy += diff + this.options.hierarchical.treeSpacing;
        shiftTree(i + 1, shiftBy);
      }
    };

    // shift a single tree by an offset
    const shiftTree = (index, offset) => {
      const trees = this.hierarchical.trees;

      for (const nodeId in trees) {
        if (Object.prototype.hasOwnProperty.call(trees, nodeId)) {
          if (trees[nodeId] === index) {
            this.direction.shift(nodeId, offset);
          }
        }
      }
    };

    // get the width of all trees
    const getTreeSizes = () => {
      const treeWidths = [];
      for (let i = 0; i < this.hierarchical.numTrees(); i++) {
        treeWidths.push(this.direction.getTreeSize(i));
      }
      return treeWidths;
    };

    // get a map of all nodes in this branch
    const getBranchNodes = (source, map) => {
      if (map[source.id]) {
        return;
      }
      map[source.id] = true;
      if (this.hierarchical.childrenReference[source.id]) {
        const children = this.hierarchical.childrenReference[source.id];
        if (children.length > 0) {
          for (let i = 0; i < children.length; i++) {
            getBranchNodes(this.body.nodes[children[i]], map);
          }
        }
      }
    };

    // get a min max width as well as the maximum movement space it has on either sides
    // we use min max terminology because width and height can interchange depending on the direction of the layout
    const getBranchBoundary = (branchMap, maxLevel = 1e9) => {
      let minSpace = 1e9;
      let maxSpace = 1e9;
      let min = 1e9;
      let max = -1e9;
      for (const branchNode in branchMap) {
        if (Object.prototype.hasOwnProperty.call(branchMap, branchNode)) {
          const node = this.body.nodes[branchNode];
          const level = this.hierarchical.levels[node.id];
          const position = this.direction.getPosition(node);

          // get the space around the node.
          const [minSpaceNode, maxSpaceNode] = this._getSpaceAroundNode(
            node,
            branchMap
          );
          minSpace = Math.min(minSpaceNode, minSpace);
          maxSpace = Math.min(maxSpaceNode, maxSpace);

          // the width is only relevant for the levels two nodes have in common. This is why we filter on this.
          if (level <= maxLevel) {
            min = Math.min(position, min);
            max = Math.max(position, max);
          }
        }
      }

      return [min, max, minSpace, maxSpace];
    };

    // check what the maximum level is these nodes have in common.
    const getCollisionLevel = (node1, node2) => {
      const maxLevel1 = this.hierarchical.getMaxLevel(node1.id);
      const maxLevel2 = this.hierarchical.getMaxLevel(node2.id);
      return Math.min(maxLevel1, maxLevel2);
    };

    /**
     * Condense elements. These can be nodes or branches depending on the callback.
     *
     * @param {Function} callback
     * @param {Array.<number>} levels
     * @param {*} centerParents
     */
    const shiftElementsCloser = (callback, levels, centerParents) => {
      const hier = this.hierarchical;

      for (let i = 0; i < levels.length; i++) {
        const level = levels[i];
        const levelNodes = hier.distributionOrdering[level];
        if (levelNodes.length > 1) {
          for (let j = 0; j < levelNodes.length - 1; j++) {
            const node1 = levelNodes[j];
            const node2 = levelNodes[j + 1];

            // NOTE: logic maintained as it was; if nodes have same ancestor,
            //       then of course they are in the same sub-network.
            if (
              hier.hasSameParent(node1, node2) &&
              hier.inSameSubNetwork(node1, node2)
            ) {
              callback(node1, node2, centerParents);
            }
          }
        }
      }
    };

    // callback for shifting branches
    const branchShiftCallback = (node1, node2, centerParent = false) => {
      //window.CALLBACKS.push(() => {
      const pos1 = this.direction.getPosition(node1);
      const pos2 = this.direction.getPosition(node2);
      const diffAbs = Math.abs(pos2 - pos1);
      const nodeSpacing = this.options.hierarchical.nodeSpacing;
      //console.log("NOW CHECKING:", node1.id, node2.id, diffAbs);
      if (diffAbs > nodeSpacing) {
        const branchNodes1 = {};
        const branchNodes2 = {};

        getBranchNodes(node1, branchNodes1);
        getBranchNodes(node2, branchNodes2);

        // check the largest distance between the branches
        const maxLevel = getCollisionLevel(node1, node2);
        const branchNodeBoundary1 = getBranchBoundary(branchNodes1, maxLevel);
        const branchNodeBoundary2 = getBranchBoundary(branchNodes2, maxLevel);
        const max1 = branchNodeBoundary1[1];
        const min2 = branchNodeBoundary2[0];
        const minSpace2 = branchNodeBoundary2[2];

        //console.log(node1.id, getBranchBoundary(branchNodes1, maxLevel), node2.id,
        //            getBranchBoundary(branchNodes2, maxLevel), maxLevel);
        const diffBranch = Math.abs(max1 - min2);
        if (diffBranch > nodeSpacing) {
          let offset = max1 - min2 + nodeSpacing;
          if (offset < -minSpace2 + nodeSpacing) {
            offset = -minSpace2 + nodeSpacing;
            //console.log("RESETTING OFFSET", max1 - min2 + this.options.hierarchical.nodeSpacing, -minSpace2, offset);
          }
          if (offset < 0) {
            //console.log("SHIFTING", node2.id, offset);
            this._shiftBlock(node2.id, offset);
            stillShifting = true;

            if (centerParent === true) this._centerParent(node2);
          }
        }
      }
      //this.body.emitter.emit("_redraw");})
    };

    const minimizeEdgeLength = (iterations, node) => {
      //window.CALLBACKS.push(() => {
      //  console.log("ts",node.id);
      const nodeId = node.id;
      const allEdges = node.edges;
      const nodeLevel = this.hierarchical.levels[node.id];

      // gather constants
      const C2 =
        this.options.hierarchical.levelSeparation *
        this.options.hierarchical.levelSeparation;
      const referenceNodes = {};
      const aboveEdges = [];
      for (let i = 0; i < allEdges.length; i++) {
        const edge = allEdges[i];
        if (edge.toId != edge.fromId) {
          const otherNode = edge.toId == nodeId ? edge.from : edge.to;
          referenceNodes[allEdges[i].id] = otherNode;
          if (this.hierarchical.levels[otherNode.id] < nodeLevel) {
            aboveEdges.push(edge);
          }
        }
      }

      // differentiated sum of lengths based on only moving one node over one axis
      const getFx = (point, edges) => {
        let sum = 0;
        for (let i = 0; i < edges.length; i++) {
          if (referenceNodes[edges[i].id] !== undefined) {
            const a =
              this.direction.getPosition(referenceNodes[edges[i].id]) - point;
            sum += a / Math.sqrt(a * a + C2);
          }
        }
        return sum;
      };

      // doubly differentiated sum of lengths based on only moving one node over one axis
      const getDFx = (point, edges) => {
        let sum = 0;
        for (let i = 0; i < edges.length; i++) {
          if (referenceNodes[edges[i].id] !== undefined) {
            const a =
              this.direction.getPosition(referenceNodes[edges[i].id]) - point;
            sum -= C2 * Math.pow(a * a + C2, -1.5);
          }
        }
        return sum;
      };

      const getGuess = (iterations, edges) => {
        let guess = this.direction.getPosition(node);
        // Newton's method for optimization
        const guessMap = {};
        for (let i = 0; i < iterations; i++) {
          const fx = getFx(guess, edges);
          const dfx = getDFx(guess, edges);

          // we limit the movement to avoid instability.
          const limit = 40;
          const ratio = Math.max(-limit, Math.min(limit, Math.round(fx / dfx)));
          guess = guess - ratio;
          // reduce duplicates
          if (guessMap[guess] !== undefined) {
            break;
          }
          guessMap[guess] = i;
        }
        return guess;
      };

      const moveBranch = (guess) => {
        // position node if there is space
        const nodePosition = this.direction.getPosition(node);

        // check movable area of the branch
        if (branches[node.id] === undefined) {
          const branchNodes = {};
          getBranchNodes(node, branchNodes);
          branches[node.id] = branchNodes;
        }
        const branchBoundary = getBranchBoundary(branches[node.id]);
        const minSpaceBranch = branchBoundary[2];
        const maxSpaceBranch = branchBoundary[3];

        const diff = guess - nodePosition;

        // check if we are allowed to move the node:
        let branchOffset = 0;
        if (diff > 0) {
          branchOffset = Math.min(
            diff,
            maxSpaceBranch - this.options.hierarchical.nodeSpacing
          );
        } else if (diff < 0) {
          branchOffset = -Math.min(
            -diff,
            minSpaceBranch - this.options.hierarchical.nodeSpacing
          );
        }

        if (branchOffset != 0) {
          //console.log("moving branch:",branchOffset, maxSpaceBranch, minSpaceBranch)
          this._shiftBlock(node.id, branchOffset);
          //this.body.emitter.emit("_redraw");
          stillShifting = true;
        }
      };

      const moveNode = (guess) => {
        const nodePosition = this.direction.getPosition(node);

        // position node if there is space
        const [minSpace, maxSpace] = this._getSpaceAroundNode(node);
        const diff = guess - nodePosition;
        // check if we are allowed to move the node:
        let newPosition = nodePosition;
        if (diff > 0) {
          newPosition = Math.min(
            nodePosition + (maxSpace - this.options.hierarchical.nodeSpacing),
            guess
          );
        } else if (diff < 0) {
          newPosition = Math.max(
            nodePosition - (minSpace - this.options.hierarchical.nodeSpacing),
            guess
          );
        }

        if (newPosition !== nodePosition) {
          //console.log("moving Node:",diff, minSpace, maxSpace);
          this.direction.setPosition(node, newPosition);
          //this.body.emitter.emit("_redraw");
          stillShifting = true;
        }
      };

      let guess = getGuess(iterations, aboveEdges);
      moveBranch(guess);
      guess = getGuess(iterations, allEdges);
      moveNode(guess);
      //})
    };

    // method to remove whitespace between branches. Because we do bottom up, we can center the parents.
    const minimizeEdgeLengthBottomUp = (iterations) => {
      let levels = this.hierarchical.getLevels();
      levels = levels.reverse();
      for (let i = 0; i < iterations; i++) {
        stillShifting = false;
        for (let j = 0; j < levels.length; j++) {
          const level = levels[j];
          const levelNodes = this.hierarchical.distributionOrdering[level];
          for (let k = 0; k < levelNodes.length; k++) {
            minimizeEdgeLength(1000, levelNodes[k]);
          }
        }
        if (stillShifting !== true) {
          //console.log("FINISHED minimizeEdgeLengthBottomUp IN " + i);
          break;
        }
      }
    };

    // method to remove whitespace between branches. Because we do bottom up, we can center the parents.
    const shiftBranchesCloserBottomUp = (iterations) => {
      let levels = this.hierarchical.getLevels();
      levels = levels.reverse();
      for (let i = 0; i < iterations; i++) {
        stillShifting = false;
        shiftElementsCloser(branchShiftCallback, levels, true);
        if (stillShifting !== true) {
          //console.log("FINISHED shiftBranchesCloserBottomUp IN " + (i+1));
          break;
        }
      }
    };

    // center all parents
    const centerAllParents = () => {
      for (const nodeId in this.body.nodes) {
        if (Object.prototype.hasOwnProperty.call(this.body.nodes, nodeId))
          this._centerParent(this.body.nodes[nodeId]);
      }
    };

    // center all parents
    const centerAllParentsBottomUp = () => {
      let levels = this.hierarchical.getLevels();
      levels = levels.reverse();
      for (let i = 0; i < levels.length; i++) {
        const level = levels[i];
        const levelNodes = this.hierarchical.distributionOrdering[level];
        for (let j = 0; j < levelNodes.length; j++) {
          this._centerParent(levelNodes[j]);
        }
      }
    };

    // the actual work is done here.
    if (this.options.hierarchical.blockShifting === true) {
      shiftBranchesCloserBottomUp(5);
      centerAllParents();
    }

    // minimize edge length
    if (this.options.hierarchical.edgeMinimization === true) {
      minimizeEdgeLengthBottomUp(20);
    }

    if (this.options.hierarchical.parentCentralization === true) {
      centerAllParentsBottomUp();
    }

    shiftTrees();
  }

  /**
   * This gives the space around the node. IF a map is supplied, it will only check against nodes NOT in the map.
   * This is used to only get the distances to nodes outside of a branch.
   *
   * @param {Node} node
   * @param {{Node.id: vis.Node}} map
   * @returns {number[]}
   * @private
   */
  _getSpaceAroundNode(node, map) {
    let useMap = true;
    if (map === undefined) {
      useMap = false;
    }
    const level = this.hierarchical.levels[node.id];
    if (level !== undefined) {
      const index = this.hierarchical.distributionIndex[node.id];
      const position = this.direction.getPosition(node);
      const ordering = this.hierarchical.distributionOrdering[level];
      let minSpace = 1e9;
      let maxSpace = 1e9;
      if (index !== 0) {
        const prevNode = ordering[index - 1];
        if (
          (useMap === true && map[prevNode.id] === undefined) ||
          useMap === false
        ) {
          const prevPos = this.direction.getPosition(prevNode);
          minSpace = position - prevPos;
        }
      }

      if (index != ordering.length - 1) {
        const nextNode = ordering[index + 1];
        if (
          (useMap === true && map[nextNode.id] === undefined) ||
          useMap === false
        ) {
          const nextPos = this.direction.getPosition(nextNode);
          maxSpace = Math.min(maxSpace, nextPos - position);
        }
      }

      return [minSpace, maxSpace];
    } else {
      return [0, 0];
    }
  }

  /**
   * We use this method to center a parent node and check if it does not cross other nodes when it does.
   *
   * @param {Node} node
   * @private
   */
  _centerParent(node) {
    if (this.hierarchical.parentReference[node.id]) {
      const parents = this.hierarchical.parentReference[node.id];
      for (let i = 0; i < parents.length; i++) {
        const parentId = parents[i];
        const parentNode = this.body.nodes[parentId];
        const children = this.hierarchical.childrenReference[parentId];

        if (children !== undefined) {
          // get the range of the children
          const newPosition = this._getCenterPosition(children);

          const position = this.direction.getPosition(parentNode);
          const [minSpace, maxSpace] = this._getSpaceAroundNode(parentNode);
          const diff = position - newPosition;
          if (
            (diff < 0 &&
              Math.abs(diff) <
                maxSpace - this.options.hierarchical.nodeSpacing) ||
            (diff > 0 &&
              Math.abs(diff) < minSpace - this.options.hierarchical.nodeSpacing)
          ) {
            this.direction.setPosition(parentNode, newPosition);
          }
        }
      }
    }
  }

  /**
   * This function places the nodes on the canvas based on the hierarchial distribution.
   *
   * @param {object} distribution | obtained by the function this._getDistribution()
   * @private
   */
  _placeNodesByHierarchy(distribution) {
    this.positionedNodes = {};
    // start placing all the level 0 nodes first. Then recursively position their branches.
    for (const level in distribution) {
      if (Object.prototype.hasOwnProperty.call(distribution, level)) {
        // sort nodes in level by position:
        let nodeArray = Object.keys(distribution[level]);
        nodeArray = this._indexArrayToNodes(nodeArray);
        this.direction.sort(nodeArray);
        let handledNodeCount = 0;

        for (let i = 0; i < nodeArray.length; i++) {
          const node = nodeArray[i];
          if (this.positionedNodes[node.id] === undefined) {
            const spacing = this.options.hierarchical.nodeSpacing;
            let pos = spacing * handledNodeCount;
            // We get the X or Y values we need and store them in pos and previousPos.
            // The get and set make sure we get X or Y
            if (handledNodeCount > 0) {
              pos = this.direction.getPosition(nodeArray[i - 1]) + spacing;
            }
            this.direction.setPosition(node, pos, level);
            this._validatePositionAndContinue(node, level, pos);

            handledNodeCount++;
          }
        }
      }
    }
  }

  /**
   * This is a recursively called function to enumerate the branches from the largest hubs and place the nodes
   * on a X position that ensures there will be no overlap.
   *
   * @param {Node.id} parentId
   * @param {number} parentLevel
   * @private
   */
  _placeBranchNodes(parentId, parentLevel) {
    const childRef = this.hierarchical.childrenReference[parentId];

    // if this is not a parent, cancel the placing. This can happen with multiple parents to one child.
    if (childRef === undefined) {
      return;
    }

    // get a list of childNodes
    const childNodes = [];
    for (let i = 0; i < childRef.length; i++) {
      childNodes.push(this.body.nodes[childRef[i]]);
    }

    // use the positions to order the nodes.
    this.direction.sort(childNodes);

    // position the childNodes
    for (let i = 0; i < childNodes.length; i++) {
      const childNode = childNodes[i];
      const childNodeLevel = this.hierarchical.levels[childNode.id];
      // check if the child node is below the parent node and if it has already been positioned.
      if (
        childNodeLevel > parentLevel &&
        this.positionedNodes[childNode.id] === undefined
      ) {
        // get the amount of space required for this node. If parent the width is based on the amount of children.
        const spacing = this.options.hierarchical.nodeSpacing;
        let pos;

        // we get the X or Y values we need and store them in pos and previousPos.
        // The get and set make sure we get X or Y
        if (i === 0) {
          pos = this.direction.getPosition(this.body.nodes[parentId]);
        } else {
          pos = this.direction.getPosition(childNodes[i - 1]) + spacing;
        }
        this.direction.setPosition(childNode, pos, childNodeLevel);
        this._validatePositionAndContinue(childNode, childNodeLevel, pos);
      } else {
        return;
      }
    }

    // center the parent nodes.
    const center = this._getCenterPosition(childNodes);
    this.direction.setPosition(this.body.nodes[parentId], center, parentLevel);
  }

  /**
   * This method checks for overlap and if required shifts the branch. It also keeps records of positioned nodes.
   * Finally it will call _placeBranchNodes to place the branch nodes.
   *
   * @param {Node} node
   * @param {number} level
   * @param {number} pos
   * @private
   */
  _validatePositionAndContinue(node, level, pos) {
    // This method only works for formal trees and formal forests
    // Early exit if this is not the case
    if (!this.hierarchical.isTree) return;

    // if overlap has been detected, we shift the branch
    if (this.lastNodeOnLevel[level] !== undefined) {
      const previousPos = this.direction.getPosition(
        this.body.nodes[this.lastNodeOnLevel[level]]
      );
      if (pos - previousPos < this.options.hierarchical.nodeSpacing) {
        const diff = previousPos + this.options.hierarchical.nodeSpacing - pos;
        const sharedParent = this._findCommonParent(
          this.lastNodeOnLevel[level],
          node.id
        );
        this._shiftBlock(sharedParent.withChild, diff);
      }
    }

    this.lastNodeOnLevel[level] = node.id; // store change in position.
    this.positionedNodes[node.id] = true;
    this._placeBranchNodes(node.id, level);
  }

  /**
   * Receives an array with node indices and returns an array with the actual node references.
   * Used for sorting based on node properties.
   *
   * @param {Array.<Node.id>} idArray
   * @returns {Array.<Node>}
   */
  _indexArrayToNodes(idArray) {
    const array = [];
    for (let i = 0; i < idArray.length; i++) {
      array.push(this.body.nodes[idArray[i]]);
    }
    return array;
  }

  /**
   * This function get the distribution of levels based on hubsize
   *
   * @returns {object}
   * @private
   */
  _getDistribution() {
    const distribution = {};
    let nodeId, node;

    // we fix Y because the hierarchy is vertical,
    // we fix X so we do not give a node an x position for a second time.
    // the fix of X is removed after the x value has been set.
    for (nodeId in this.body.nodes) {
      if (Object.prototype.hasOwnProperty.call(this.body.nodes, nodeId)) {
        node = this.body.nodes[nodeId];
        const level =
          this.hierarchical.levels[nodeId] === undefined
            ? 0
            : this.hierarchical.levels[nodeId];
        this.direction.fix(node, level);
        if (distribution[level] === undefined) {
          distribution[level] = {};
        }
        distribution[level][nodeId] = node;
      }
    }
    return distribution;
  }

  /**
   * Return the active (i.e. visible) edges for this node
   *
   * @param {Node} node
   * @returns {Array.<vis.Edge>} Array of edge instances
   * @private
   */
  _getActiveEdges(node) {
    const result = [];

    forEach(node.edges, (edge) => {
      if (this.body.edgeIndices.indexOf(edge.id) !== -1) {
        result.push(edge);
      }
    });

    return result;
  }

  /**
   * Get the hubsizes for all active nodes.
   *
   * @returns {number}
   * @private
   */
  _getHubSizes() {
    const hubSizes = {};
    const nodeIds = this.body.nodeIndices;

    forEach(nodeIds, (nodeId) => {
      const node = this.body.nodes[nodeId];
      const hubSize = this._getActiveEdges(node).length;
      hubSizes[hubSize] = true;
    });

    // Make an array of the size sorted descending
    const result = [];
    forEach(hubSizes, (size) => {
      result.push(Number(size));
    });

    result.sort(function (a, b) {
      return b - a;
    });

    return result;
  }

  /**
   * this function allocates nodes in levels based on the recursive branching from the largest hubs.
   *
   * @private
   */
  _determineLevelsByHubsize() {
    const levelDownstream = (nodeA, nodeB) => {
      this.hierarchical.levelDownstream(nodeA, nodeB);
    };

    const hubSizes = this._getHubSizes();

    for (let i = 0; i < hubSizes.length; ++i) {
      const hubSize = hubSizes[i];
      if (hubSize === 0) break;

      forEach(this.body.nodeIndices, (nodeId) => {
        const node = this.body.nodes[nodeId];

        if (hubSize === this._getActiveEdges(node).length) {
          this._crawlNetwork(levelDownstream, nodeId);
        }
      });
    }
  }

  /**
   * TODO: release feature
   * TODO: Determine if this feature is needed at all
   *
   * @private
   */
  _determineLevelsCustomCallback() {
    const minLevel = 100000;

    // TODO: this should come from options.
    // eslint-disable-next-line no-unused-vars -- This should eventually be implemented with these parameters used.
    const customCallback = function (nodeA, nodeB, edge) {};

    // TODO: perhaps move to HierarchicalStatus.
    //       But I currently don't see the point, this method is not used.
    const levelByDirection = (nodeA, nodeB, edge) => {
      let levelA = this.hierarchical.levels[nodeA.id];
      // set initial level
      if (levelA === undefined) {
        levelA = this.hierarchical.levels[nodeA.id] = minLevel;
      }

      const diff = customCallback(
        NetworkUtil.cloneOptions(nodeA, "node"),
        NetworkUtil.cloneOptions(nodeB, "node"),
        NetworkUtil.cloneOptions(edge, "edge")
      );

      this.hierarchical.levels[nodeB.id] = levelA + diff;
    };

    this._crawlNetwork(levelByDirection);
    this.hierarchical.setMinLevelToZero(this.body.nodes);
  }

  /**
   * Allocate nodes in levels based on the direction of the edges.
   *
   * @private
   */
  _determineLevelsDirected() {
    const nodes = this.body.nodeIndices.reduce((acc, id) => {
      acc.set(id, this.body.nodes[id]);
      return acc;
    }, new Map());

    if (this.options.hierarchical.shakeTowards === "roots") {
      this.hierarchical.levels = fillLevelsByDirectionRoots(nodes);
    } else {
      this.hierarchical.levels = fillLevelsByDirectionLeaves(nodes);
    }

    this.hierarchical.setMinLevelToZero(this.body.nodes);
  }

  /**
   * Update the bookkeeping of parent and child.
   *
   * @private
   */
  _generateMap() {
    const fillInRelations = (parentNode, childNode) => {
      if (
        this.hierarchical.levels[childNode.id] >
        this.hierarchical.levels[parentNode.id]
      ) {
        this.hierarchical.addRelation(parentNode.id, childNode.id);
      }
    };

    this._crawlNetwork(fillInRelations);
    this.hierarchical.checkIfTree();
  }

  /**
   * Crawl over the entire network and use a callback on each node couple that is connected to each other.
   *
   * @param {Function} [callback=function(){}]          | will receive nodeA, nodeB and the connecting edge. A and B are distinct.
   * @param {Node.id} startingNodeId
   * @private
   */
  _crawlNetwork(callback = function () {}, startingNodeId) {
    const progress = {};

    const crawler = (node, tree) => {
      if (progress[node.id] === undefined) {
        this.hierarchical.setTreeIndex(node, tree);

        progress[node.id] = true;
        let childNode;
        const edges = this._getActiveEdges(node);
        for (let i = 0; i < edges.length; i++) {
          const edge = edges[i];
          if (edge.connected === true) {
            if (edge.toId == node.id) {
              // Not '===' because id's can be string and numeric
              childNode = edge.from;
            } else {
              childNode = edge.to;
            }

            if (node.id != childNode.id) {
              // Not '!==' because id's can be string and numeric
              callback(node, childNode, edge);
              crawler(childNode, tree);
            }
          }
        }
      }
    };

    if (startingNodeId === undefined) {
      // Crawl over all nodes
      let treeIndex = 0; // Serves to pass a unique id for the current distinct tree

      for (let i = 0; i < this.body.nodeIndices.length; i++) {
        const nodeId = this.body.nodeIndices[i];

        if (progress[nodeId] === undefined) {
          const node = this.body.nodes[nodeId];
          crawler(node, treeIndex);
          treeIndex += 1;
        }
      }
    } else {
      // Crawl from the given starting node
      const node = this.body.nodes[startingNodeId];
      if (node === undefined) {
        console.error("Node not found:", startingNodeId);
        return;
      }
      crawler(node);
    }
  }

  /**
   * Shift a branch a certain distance
   *
   * @param {Node.id} parentId
   * @param {number} diff
   * @private
   */
  _shiftBlock(parentId, diff) {
    const progress = {};
    const shifter = (parentId) => {
      if (progress[parentId]) {
        return;
      }
      progress[parentId] = true;
      this.direction.shift(parentId, diff);

      const childRef = this.hierarchical.childrenReference[parentId];
      if (childRef !== undefined) {
        for (let i = 0; i < childRef.length; i++) {
          shifter(childRef[i]);
        }
      }
    };
    shifter(parentId);
  }

  /**
   * Find a common parent between branches.
   *
   * @param {Node.id} childA
   * @param {Node.id} childB
   * @returns {{foundParent, withChild}}
   * @private
   */
  _findCommonParent(childA, childB) {
    const parents = {};
    const iterateParents = (parents, child) => {
      const parentRef = this.hierarchical.parentReference[child];
      if (parentRef !== undefined) {
        for (let i = 0; i < parentRef.length; i++) {
          const parent = parentRef[i];
          parents[parent] = true;
          iterateParents(parents, parent);
        }
      }
    };
    const findParent = (parents, child) => {
      const parentRef = this.hierarchical.parentReference[child];
      if (parentRef !== undefined) {
        for (let i = 0; i < parentRef.length; i++) {
          const parent = parentRef[i];
          if (parents[parent] !== undefined) {
            return { foundParent: parent, withChild: child };
          }
          const branch = findParent(parents, parent);
          if (branch.foundParent !== null) {
            return branch;
          }
        }
      }
      return { foundParent: null, withChild: child };
    };

    iterateParents(parents, childA);
    return findParent(parents, childB);
  }

  /**
   * Set the strategy pattern for handling the coordinates given the current direction.
   *
   * The individual instances contain all the operations and data specific to a layout direction.
   *
   * @param {Node} node
   * @param {{x: number, y: number}} position
   * @param {number} level
   * @param {boolean} [doNotUpdate=false]
   * @private
   */
  setDirectionStrategy() {
    const isVertical =
      this.options.hierarchical.direction === "UD" ||
      this.options.hierarchical.direction === "DU";

    if (isVertical) {
      this.direction = new VerticalStrategy(this);
    } else {
      this.direction = new HorizontalStrategy(this);
    }
  }

  /**
   * Determine the center position of a branch from the passed list of child nodes
   *
   * This takes into account the positions of all the child nodes.
   *
   * @param {Array.<Node|vis.Node.id>} childNodes  Array of either child nodes or node id's
   * @returns {number}
   * @private
   */
  _getCenterPosition(childNodes) {
    let minPos = 1e9;
    let maxPos = -1e9;

    for (let i = 0; i < childNodes.length; i++) {
      let childNode;
      if (childNodes[i].id !== undefined) {
        childNode = childNodes[i];
      } else {
        const childNodeId = childNodes[i];
        childNode = this.body.nodes[childNodeId];
      }

      const position = this.direction.getPosition(childNode);
      minPos = Math.min(minPos, position);
      maxPos = Math.max(maxPos, position);
    }

    return 0.5 * (minPos + maxPos);
  }
}

export default LayoutEngine;
