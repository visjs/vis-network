/**
 * Helper classes for LayoutEngine.
 *
 * Strategy pattern for usage of direction methods for hierarchical layouts.
 */

/**
 * Interface definition for direction strategy classes.
 *
 * This class describes the interface for the Strategy
 * pattern classes used to differentiate horizontal and vertical
 * direction of hierarchical results.
 *
 * For a given direction, one coordinate will be 'fixed', meaning that it is
 * determined by level.
 * The other coordinate is 'unfixed', meaning that the nodes on a given level
 * can still move along that coordinate. So:
 *
 * - `vertical` layout: `x` unfixed, `y` fixed per level
 * - `horizontal` layout: `x` fixed per level, `y` unfixed
 *
 * The local methods are stubs and should be regarded as abstract.
 * Derived classes **must** implement all the methods themselves.
 * @private
 */
class DirectionInterface {
  /**
   * @ignore
   */
  abstract() {
    throw new Error("Can't instantiate abstract class!");
  }

  /**
   * This is a dummy call which is used to suppress the jsdoc errors of type:
   *
   * "'param' is assigned a value but never used"
   * @ignore
   */
  fake_use() {
    // Do nothing special
  }

  /**
   * Type to use to translate dynamic curves to, in the case of hierarchical layout.
   * Dynamic curves do not work for these.
   *
   * The value should be perpendicular to the actual direction of the layout.
   * @returns {string} Direction, either 'vertical' or 'horizontal'
   */
  curveType() {
    return this.abstract();
  }

  /**
   * Return the value of the coordinate that is not fixed for this direction.
   * @param {Node} node The node to read
   * @returns {number} Value of the unfixed coordinate
   */
  getPosition(node) {
    this.fake_use(node);
    return this.abstract();
  }

  /**
   * Set the value of the coordinate that is not fixed for this direction.
   * @param {Node} node The node to adjust
   * @param {number} position
   * @param {number} [level] if specified, the hierarchy level that this node should be fixed to
   */
  setPosition(node, position, level = undefined) {
    this.fake_use(node, position, level);
    this.abstract();
  }

  /**
   * Get the width of a tree.
   *
   * A `tree` here is a subset of nodes within the network which are not connected to other nodes,
   * only among themselves. In essence, it is a sub-network.
   * @param {number} index The index number of a tree
   * @returns {number} the width of a tree in the view coordinates
   */
  getTreeSize(index) {
    this.fake_use(index);
    return this.abstract();
  }

  /**
   * Sort array of nodes on the unfixed coordinates.
   *
   * Note:** chrome has non-stable sorting implementation, which
   * has a tendency to change the order of the array items,
   * even if the custom sort function returns 0.
   *
   * For this reason, an external sort implementation is used,
   * which has the added benefit of being faster than the standard
   * platforms implementation. This has been verified on `node.js`,
   * `firefox` and `chrome` (all linux).
   * @param {Array.<Node>} nodeArray array of nodes to sort
   */
  sort(nodeArray) {
    this.fake_use(nodeArray);
    this.abstract();
  }

  /**
   * Assign the fixed coordinate of the node to the given level
   * @param {Node} node The node to adjust
   * @param {number} level The level to fix to
   */
  fix(node, level) {
    this.fake_use(node, level);
    this.abstract();
  }

  /**
   * Add an offset to the unfixed coordinate of the given node.
   * @param {NodeId} nodeId Id of the node to adjust
   * @param {number} diff Offset to add to the unfixed coordinate
   */
  shift(nodeId, diff) {
    this.fake_use(nodeId, diff);
    this.abstract();
  }
}

/**
 * Vertical Strategy
 *
 * Coordinate `y` is fixed on levels, coordinate `x` is unfixed.
 * @augments DirectionInterface
 * @private
 */
class VerticalStrategy extends DirectionInterface {
  /**
   * Constructor
   * @param {object} layout reference to the parent LayoutEngine instance.
   */
  constructor(layout) {
    super();
    this.layout = layout;
  }

  /** @inheritDoc */
  curveType() {
    return "horizontal";
  }

  /** @inheritDoc */
  getPosition(node) {
    return node.x;
  }

  /** @inheritDoc */
  setPosition(node, position, level = undefined) {
    if (level !== undefined) {
      this.layout.hierarchical.addToOrdering(node, level);
    }
    node.x = position;
  }

  /** @inheritDoc */
  getTreeSize(index) {
    const res = this.layout.hierarchical.getTreeSize(
      this.layout.body.nodes,
      index,
    );
    return { min: res.min_x, max: res.max_x };
  }

  /** @inheritDoc */
  sort(nodeArray) {
    nodeArray.sort(function (a, b) {
      return a.x - b.x;
    });
  }

  /** @inheritDoc */
  fix(node, level) {
    node.y = this.layout.options.hierarchical.levelSeparation * level;
    node.options.fixed.y = true;
  }

  /** @inheritDoc */
  shift(nodeId, diff) {
    this.layout.body.nodes[nodeId].x += diff;
  }
}

/**
 * Horizontal Strategy
 *
 * Coordinate `x` is fixed on levels, coordinate `y` is unfixed.
 * @augments DirectionInterface
 * @private
 */
class HorizontalStrategy extends DirectionInterface {
  /**
   * Constructor
   * @param {object} layout reference to the parent LayoutEngine instance.
   */
  constructor(layout) {
    super();
    this.layout = layout;
  }

  /** @inheritDoc */
  curveType() {
    return "vertical";
  }

  /** @inheritDoc */
  getPosition(node) {
    return node.y;
  }

  /** @inheritDoc */
  setPosition(node, position, level = undefined) {
    if (level !== undefined) {
      this.layout.hierarchical.addToOrdering(node, level);
    }
    node.y = position;
  }

  /** @inheritDoc */
  getTreeSize(index) {
    const res = this.layout.hierarchical.getTreeSize(
      this.layout.body.nodes,
      index,
    );
    return { min: res.min_y, max: res.max_y };
  }

  /** @inheritDoc */
  sort(nodeArray) {
    nodeArray.sort(function (a, b) {
      return a.y - b.y;
    });
  }

  /** @inheritDoc */
  fix(node, level) {
    node.x = this.layout.options.hierarchical.levelSeparation * level;
    node.options.fixed.x = true;
  }

  /** @inheritDoc */
  shift(nodeId, diff) {
    this.layout.body.nodes[nodeId].y += diff;
  }
}

export { HorizontalStrategy, VerticalStrategy };
