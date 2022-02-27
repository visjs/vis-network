import { bridgeObject, forEach } from "vis-util/esnext";
import { DataSet, isDataViewLike } from "vis-data/esnext";
import Node from "./components/Node";

/**
 * Handler for Nodes
 */
class NodesHandler {
  /**
   * @param {object} body
   * @param {Images} images
   * @param {Array.<Group>} groups
   * @param {LayoutEngine} layoutEngine
   */
  constructor(body, images, groups, layoutEngine) {
    this.body = body;
    this.images = images;
    this.groups = groups;
    this.layoutEngine = layoutEngine;

    // create the node API in the body container
    this.body.functions.createNode = this.create.bind(this);

    this.nodesListeners = {
      add: (event, params) => {
        this.add(params.items);
      },
      update: (event, params) => {
        this.update(params.items, params.data, params.oldData);
      },
      remove: (event, params) => {
        this.remove(params.items);
      },
    };

    this.defaultOptions = {
      borderWidth: 1,
      borderWidthSelected: undefined,
      brokenImage: undefined,
      color: {
        border: "#2B7CE9",
        background: "#97C2FC",
        highlight: {
          border: "#2B7CE9",
          background: "#D2E5FF",
        },
        hover: {
          border: "#2B7CE9",
          background: "#D2E5FF",
        },
      },
      opacity: undefined, // number between 0 and 1
      fixed: {
        x: false,
        y: false,
      },
      font: {
        color: "#343434",
        size: 14, // px
        face: "arial",
        background: "none",
        strokeWidth: 0, // px
        strokeColor: "#ffffff",
        align: "center",
        vadjust: 0,
        multi: false,
        bold: {
          mod: "bold",
        },
        boldital: {
          mod: "bold italic",
        },
        ital: {
          mod: "italic",
        },
        mono: {
          mod: "",
          size: 15, // px
          face: "monospace",
          vadjust: 2,
        },
      },
      group: undefined,
      hidden: false,
      icon: {
        face: "FontAwesome", //'FontAwesome',
        code: undefined, //'\uf007',
        size: 50, //50,
        color: "#2B7CE9", //'#aa00ff'
      },
      image: undefined, // --> URL
      imagePadding: {
        // only for image shape
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
      },
      label: undefined,
      labelHighlightBold: true,
      level: undefined,
      margin: {
        top: 5,
        right: 5,
        bottom: 5,
        left: 5,
      },
      mass: 1,
      physics: true,
      scaling: {
        min: 10,
        max: 30,
        label: {
          enabled: false,
          min: 14,
          max: 30,
          maxVisible: 30,
          drawThreshold: 5,
        },
        customScalingFunction: function (min, max, total, value) {
          if (max === min) {
            return 0.5;
          } else {
            const scale = 1 / (max - min);
            return Math.max(0, (value - min) * scale);
          }
        },
      },
      shadow: {
        enabled: false,
        color: "rgba(0,0,0,0.5)",
        size: 10,
        x: 5,
        y: 5,
      },
      shape: "ellipse",
      shapeProperties: {
        borderDashes: false, // only for borders
        borderRadius: 6, // only for box shape
        interpolation: true, // only for image and circularImage shapes
        useImageSize: false, // only for image and circularImage shapes
        useBorderWithImage: false, // only for image shape
        coordinateOrigin: "center", // only for image and circularImage shapes
      },
      size: 25,
      title: undefined,
      value: undefined,
      x: undefined,
      y: undefined,
    };

    // Protect from idiocy
    if (this.defaultOptions.mass <= 0) {
      throw "Internal error: mass in defaultOptions of NodesHandler may not be zero or negative";
    }

    this.options = bridgeObject(this.defaultOptions);

    this.bindEventListeners();
  }

  /**
   * Binds event listeners
   */
  bindEventListeners() {
    // refresh the nodes. Used when reverting from hierarchical layout
    this.body.emitter.on("refreshNodes", this.refresh.bind(this));
    this.body.emitter.on("refresh", this.refresh.bind(this));
    this.body.emitter.on("destroy", () => {
      forEach(this.nodesListeners, (callback, event) => {
        if (this.body.data.nodes) this.body.data.nodes.off(event, callback);
      });
      delete this.body.functions.createNode;
      delete this.nodesListeners.add;
      delete this.nodesListeners.update;
      delete this.nodesListeners.remove;
      delete this.nodesListeners;
    });
  }

  /**
   *
   * @param {object} options
   */
  setOptions(options) {
    if (options !== undefined) {
      Node.parseOptions(this.options, options);

      // Need to set opacity here because Node.parseOptions is also used for groups,
      // if you set opacity in Node.parseOptions it overwrites group opacity.
      if (options.opacity !== undefined) {
        if (
          Number.isNaN(options.opacity) ||
          !Number.isFinite(options.opacity) ||
          options.opacity < 0 ||
          options.opacity > 1
        ) {
          console.error(
            "Invalid option for node opacity. Value must be between 0 and 1, found: " +
              options.opacity
          );
        } else {
          this.options.opacity = options.opacity;
        }
      }

      // update the shape in all nodes
      if (options.shape !== undefined) {
        for (const nodeId in this.body.nodes) {
          if (Object.prototype.hasOwnProperty.call(this.body.nodes, nodeId)) {
            this.body.nodes[nodeId].updateShape();
          }
        }
      }

      // Update the labels of nodes if any relevant options changed.
      if (
        typeof options.font !== "undefined" ||
        typeof options.widthConstraint !== "undefined" ||
        typeof options.heightConstraint !== "undefined"
      ) {
        for (const nodeId of Object.keys(this.body.nodes)) {
          this.body.nodes[nodeId].updateLabelModule();
          this.body.nodes[nodeId].needsRefresh();
        }
      }

      // update the shape size in all nodes
      if (options.size !== undefined) {
        for (const nodeId in this.body.nodes) {
          if (Object.prototype.hasOwnProperty.call(this.body.nodes, nodeId)) {
            this.body.nodes[nodeId].needsRefresh();
          }
        }
      }

      // update the state of the variables if needed
      if (options.hidden !== undefined || options.physics !== undefined) {
        this.body.emitter.emit("_dataChanged");
      }
    }
  }

  /**
   * Set a data set with nodes for the network
   *
   * @param {Array | DataSet | DataView} nodes         The data containing the nodes.
   * @param {boolean} [doNotEmit=false] - Suppress data changed event.
   * @private
   */
  setData(nodes, doNotEmit = false) {
    const oldNodesData = this.body.data.nodes;

    if (isDataViewLike("id", nodes)) {
      this.body.data.nodes = nodes;
    } else if (Array.isArray(nodes)) {
      this.body.data.nodes = new DataSet();
      this.body.data.nodes.add(nodes);
    } else if (!nodes) {
      this.body.data.nodes = new DataSet();
    } else {
      throw new TypeError("Array or DataSet expected");
    }

    if (oldNodesData) {
      // unsubscribe from old dataset
      forEach(this.nodesListeners, function (callback, event) {
        oldNodesData.off(event, callback);
      });
    }

    // remove drawn nodes
    this.body.nodes = {};

    if (this.body.data.nodes) {
      // subscribe to new dataset
      const me = this;
      forEach(this.nodesListeners, function (callback, event) {
        me.body.data.nodes.on(event, callback);
      });

      // draw all new nodes
      const ids = this.body.data.nodes.getIds();
      this.add(ids, true);
    }

    if (doNotEmit === false) {
      this.body.emitter.emit("_dataChanged");
    }
  }

  /**
   * Add nodes
   *
   * @param {number[] | string[]} ids
   * @param {boolean} [doNotEmit=false]
   * @private
   */
  add(ids, doNotEmit = false) {
    let id;
    const newNodes = [];
    for (let i = 0; i < ids.length; i++) {
      id = ids[i];
      const properties = this.body.data.nodes.get(id);
      const node = this.create(properties);
      newNodes.push(node);
      this.body.nodes[id] = node; // note: this may replace an existing node
    }

    this.layoutEngine.positionInitially(newNodes);

    if (doNotEmit === false) {
      this.body.emitter.emit("_dataChanged");
    }
  }

  /**
   * Update existing nodes, or create them when not yet existing
   *
   * @param {number[] | string[]} ids id's of changed nodes
   * @param {Array} changedData array with changed data
   * @param {Array|undefined} oldData optional; array with previous data
   * @private
   */
  update(ids, changedData, oldData) {
    const nodes = this.body.nodes;
    let dataChanged = false;
    for (let i = 0; i < ids.length; i++) {
      const id = ids[i];
      let node = nodes[id];
      const data = changedData[i];
      if (node !== undefined) {
        // update node
        if (node.setOptions(data)) {
          dataChanged = true;
        }
      } else {
        dataChanged = true;
        // create node
        node = this.create(data);
        nodes[id] = node;
      }
    }

    if (!dataChanged && oldData !== undefined) {
      // Check for any changes which should trigger a layout recalculation
      // For now, this is just 'level' for hierarchical layout
      // Assumption: old and new data arranged in same order; at time of writing, this holds.
      dataChanged = changedData.some(function (newValue, index) {
        const oldValue = oldData[index];
        return oldValue && oldValue.level !== newValue.level;
      });
    }

    if (dataChanged === true) {
      this.body.emitter.emit("_dataChanged");
    } else {
      this.body.emitter.emit("_dataUpdated");
    }
  }

  /**
   * Remove existing nodes. If nodes do not exist, the method will just ignore it.
   *
   * @param {number[] | string[]} ids
   * @private
   */
  remove(ids) {
    const nodes = this.body.nodes;

    for (let i = 0; i < ids.length; i++) {
      const id = ids[i];
      delete nodes[id];
    }

    this.body.emitter.emit("_dataChanged");
  }

  /**
   * create a node
   *
   * @param {object} properties
   * @param {class} [constructorClass=Node.default]
   * @returns {*}
   */
  create(properties, constructorClass = Node) {
    return new constructorClass(
      properties,
      this.body,
      this.images,
      this.groups,
      this.options,
      this.defaultOptions
    );
  }

  /**
   *
   * @param {boolean} [clearPositions=false]
   */
  refresh(clearPositions = false) {
    forEach(this.body.nodes, (node, nodeId) => {
      const data = this.body.data.nodes.get(nodeId);
      if (data !== undefined) {
        if (clearPositions === true) {
          node.setOptions({ x: null, y: null });
        }
        node.setOptions({ fixed: false });
        node.setOptions(data);
      }
    });
  }

  /**
   * Returns the positions of the nodes.
   *
   * @param {Array.<Node.id> | string} [ids]  --> optional, can be array of nodeIds, can be string
   * @returns {{}}
   */
  getPositions(ids) {
    const dataArray = {};
    if (ids !== undefined) {
      if (Array.isArray(ids) === true) {
        for (let i = 0; i < ids.length; i++) {
          if (this.body.nodes[ids[i]] !== undefined) {
            const node = this.body.nodes[ids[i]];
            dataArray[ids[i]] = {
              x: Math.round(node.x),
              y: Math.round(node.y),
            };
          }
        }
      } else {
        if (this.body.nodes[ids] !== undefined) {
          const node = this.body.nodes[ids];
          dataArray[ids] = { x: Math.round(node.x), y: Math.round(node.y) };
        }
      }
    } else {
      for (let i = 0; i < this.body.nodeIndices.length; i++) {
        const node = this.body.nodes[this.body.nodeIndices[i]];
        dataArray[this.body.nodeIndices[i]] = {
          x: Math.round(node.x),
          y: Math.round(node.y),
        };
      }
    }
    return dataArray;
  }

  /**
   * Retrieves the x y position of a specific id.
   *
   * @param {string} id The id to retrieve.
   * @throws {TypeError} If no id is included.
   * @throws {ReferenceError} If an invalid id is provided.
   * @returns {{ x: number, y: number }} Returns X, Y canvas position of the node with given id.
   */
  getPosition(id) {
    if (id == undefined) {
      throw new TypeError("No id was specified for getPosition method.");
    } else if (this.body.nodes[id] == undefined) {
      throw new ReferenceError(
        `NodeId provided for getPosition does not exist. Provided: ${id}`
      );
    } else {
      return {
        x: Math.round(this.body.nodes[id].x),
        y: Math.round(this.body.nodes[id].y),
      };
    }
  }

  /**
   * Load the XY positions of the nodes into the dataset.
   */
  storePositions() {
    // todo: add support for clusters and hierarchical.
    const dataArray = [];
    const dataset = this.body.data.nodes.getDataSet();

    for (const dsNode of dataset.get()) {
      const id = dsNode.id;
      const bodyNode = this.body.nodes[id];
      const x = Math.round(bodyNode.x);
      const y = Math.round(bodyNode.y);

      if (dsNode.x !== x || dsNode.y !== y) {
        dataArray.push({ id, x, y });
      }
    }

    dataset.update(dataArray);
  }

  /**
   * get the bounding box of a node.
   *
   * @param {Node.id} nodeId
   * @returns {j|*}
   */
  getBoundingBox(nodeId) {
    if (this.body.nodes[nodeId] !== undefined) {
      return this.body.nodes[nodeId].shape.boundingBox;
    }
  }

  /**
   * Get the Ids of nodes connected to this node.
   *
   * @param {Node.id} nodeId
   * @param {'to'|'from'|undefined} direction values 'from' and 'to' select respectively parent and child nodes only.
   *                                          Any other value returns both parent and child nodes.
   * @returns {Array}
   */
  getConnectedNodes(nodeId, direction) {
    const nodeList = [];
    if (this.body.nodes[nodeId] !== undefined) {
      const node = this.body.nodes[nodeId];
      const nodeObj = {}; // used to quickly check if node already exists
      for (let i = 0; i < node.edges.length; i++) {
        const edge = node.edges[i];
        if (direction !== "to" && edge.toId == node.id) {
          // these are double equals since ids can be numeric or string
          if (nodeObj[edge.fromId] === undefined) {
            nodeList.push(edge.fromId);
            nodeObj[edge.fromId] = true;
          }
        } else if (direction !== "from" && edge.fromId == node.id) {
          // these are double equals since ids can be numeric or string
          if (nodeObj[edge.toId] === undefined) {
            nodeList.push(edge.toId);
            nodeObj[edge.toId] = true;
          }
        }
      }
    }
    return nodeList;
  }

  /**
   * Get the ids of the edges connected to this node.
   *
   * @param {Node.id} nodeId
   * @returns {*}
   */
  getConnectedEdges(nodeId) {
    const edgeList = [];
    if (this.body.nodes[nodeId] !== undefined) {
      const node = this.body.nodes[nodeId];
      for (let i = 0; i < node.edges.length; i++) {
        edgeList.push(node.edges[i].id);
      }
    } else {
      console.error(
        "NodeId provided for getConnectedEdges does not exist. Provided: ",
        nodeId
      );
    }
    return edgeList;
  }

  /**
   * Move a node.
   *
   * @param {Node.id} nodeId
   * @param {number} x
   * @param {number} y
   */
  moveNode(nodeId, x, y) {
    if (this.body.nodes[nodeId] !== undefined) {
      this.body.nodes[nodeId].x = Number(x);
      this.body.nodes[nodeId].y = Number(y);
      setTimeout(() => {
        this.body.emitter.emit("startSimulation");
      }, 0);
    } else {
      console.error(
        "Node id supplied to moveNode does not exist. Provided: ",
        nodeId
      );
    }
  }
}

export default NodesHandler;
