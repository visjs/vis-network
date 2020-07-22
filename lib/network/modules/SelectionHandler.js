import Node from './components/Node';
import Edge from './components/Edge';

import { selectiveDeepExtend } from 'vis-util/esnext';

/**
 * The handler for selections
 */
class SelectionHandler {
  /**
   * @param {Object} body
   * @param {Canvas} canvas
   */
  constructor(body, canvas) {
    this.body = body;
    this.canvas = canvas;
    this.selectionObj = { nodes: [], edges: [] };
    this.hoverObj = { nodes: {}, edges: {} };

    this.options = {};
    this.defaultOptions = {
      multiselect: false,
      selectable: true,
      selectConnectedEdges: true,
      hoverConnectedEdges: true
    };
    Object.assign(this.options, this.defaultOptions);

    this.body.emitter.on("_dataChanged", () => {
      this.updateSelection()
    });
  }


  /**
   *
   * @param {Object} [options]
   */
  setOptions(options) {
    if (options !== undefined) {
      const fields = ['multiselect', 'hoverConnectedEdges', 'selectable', 'selectConnectedEdges'];
      selectiveDeepExtend(fields, this.options, options);
    }
  }


  /**
   * handles the selection part of the tap;
   *
   * @param {{x: number, y: number}} pointer
   * @returns {boolean}
   */
  selectOnPoint(pointer) {
    let selected = false;
    if (this.options.selectable === true) {
      const obj = this.getNodeAt(pointer) || this.getEdgeAt(pointer);

      // unselect after getting the objects in order to restore width and height.
      this.unselectAll();

      if (obj !== undefined) {
        selected = this.selectObject(obj);
      }
      this.body.emitter.emit("_requestRedraw");
    }
    return selected;
  }

  /**
   *
   * @param {{x: number, y: number}} pointer
   * @returns {boolean}
   */
  selectAdditionalOnPoint(pointer) {
    let selectionChanged = false;
    if (this.options.selectable === true) {
      const obj = this.getNodeAt(pointer) || this.getEdgeAt(pointer);

      if (obj !== undefined) {
        selectionChanged = true;
        if (obj.isSelected() === true) {
          this.deselectObject(obj);
        }
        else {
          this.selectObject(obj);
        }

        this.body.emitter.emit("_requestRedraw");
      }
    }
    return selectionChanged;
  }


  /**
   * Create an object containing the standard fields for an event.
   *
   * @param {Event} event
   * @param {{x: number, y: number}} pointer Object with the x and y screen coordinates of the mouse
   * @returns {{}}
   * @private
   */
  _initBaseEvent(event, pointer) {
    const properties = {};

    properties['pointer'] = {
      DOM: { x: pointer.x, y: pointer.y },
      canvas: this.canvas.DOMtoCanvas(pointer)
    };
    properties['event'] = event;

    return properties;
  }


  /**
   * Generate an event which the user can catch.
   *
   * This adds some extra data to the event with respect to cursor position and
   * selected nodes and edges.
   *
   * @param {string} eventType                          Name of event to send
   * @param {Event}  event
   * @param {{x: number, y: number}} pointer            Object with the x and y screen coordinates of the mouse
   * @param {Object|undefined} oldSelection             If present, selection state before event occured
   * @param {boolean|undefined} [emptySelection=false]  Indicate if selection data should be passed
   */
  _generateClickEvent(eventType, event, pointer, oldSelection, emptySelection = false) {
    const properties = this._initBaseEvent(event, pointer);

    if (emptySelection === true) {
      properties.nodes = [];
      properties.edges = [];
    }
    else {
      const tmp = this.getSelection();
      properties.nodes = tmp.nodes;
      properties.edges = tmp.edges;
    }

    if (oldSelection !== undefined) {
      properties['previousSelection'] = oldSelection;
    }

    if (eventType == 'click') {
      // For the time being, restrict this functionality to
      // just the click event.
      properties.items = this.getClickedItems(pointer);
    }

    if (event.controlEdge !== undefined) {
      properties.controlEdge = event.controlEdge;
    }

    this.body.emitter.emit(eventType, properties);
  }

  /**
   *
   * @param {Object} obj
   * @param {boolean} [highlightEdges=this.options.selectConnectedEdges]
   * @returns {boolean}
   */
  selectObject(obj, highlightEdges = this.options.selectConnectedEdges) {
    if (obj !== undefined) {
      if (obj instanceof Node) {
        if (highlightEdges === true) {
          this._selectConnectedEdges(obj);
        }
      }
      obj.select();
      this._addToSelection(obj);
      return true;
    }
    return false;
  }

  /**
   *
   * @param {Object} obj
   */
  deselectObject(obj) {
    if (obj.isSelected() === true) {
      obj.selected = false;
      this._removeFromSelection(obj);
    }
  }



  /**
   * retrieve all nodes overlapping with given object
   * @param {Object} object  An object with parameters left, top, right, bottom
   * @return {number[]}   An array with id's of the overlapping nodes
   * @private
   */
  _getAllNodesOverlappingWith(object) {
    const overlappingNodes = [];
    const nodes = this.body.nodes;
    for (let i = 0; i < this.body.nodeIndices.length; i++) {
      const nodeId = this.body.nodeIndices[i];
      if (nodes[nodeId].isOverlappingWith(object)) {
        overlappingNodes.push(nodeId);
      }
    }
    return overlappingNodes;
  }


  /**
   * Return a position object in canvasspace from a single point in screenspace
   *
   * @param {{x: number, y: number}} pointer
   * @returns {{left: number, top: number, right: number, bottom: number}}
   * @private
   */
  _pointerToPositionObject(pointer) {
    const canvasPos = this.canvas.DOMtoCanvas(pointer);
    return {
      left: canvasPos.x - 1,
      top: canvasPos.y + 1,
      right: canvasPos.x + 1,
      bottom: canvasPos.y - 1
    };
  }


  /**
   * Get the top node at the passed point (like a click)
   *
   * @param {{x: number, y: number}} pointer
   * @param {boolean} [returnNode=true]
   * @return {Node | undefined} node
   */
  getNodeAt(pointer, returnNode = true) {
    // we first check if this is an navigation controls element
    const positionObject = this._pointerToPositionObject(pointer);
    const overlappingNodes = this._getAllNodesOverlappingWith(positionObject);
    // if there are overlapping nodes, select the last one, this is the
    // one which is drawn on top of the others
    if (overlappingNodes.length > 0) {
      if (returnNode === true) {
        return this.body.nodes[overlappingNodes[overlappingNodes.length - 1]];
      }
      else {
        return overlappingNodes[overlappingNodes.length - 1];
      }
    }
    else {
      return undefined;
    }
  }


  /**
   * retrieve all edges overlapping with given object, selector is around center
   * @param {Object} object  An object with parameters left, top, right, bottom
   * @param {number[]} overlappingEdges An array with id's of the overlapping nodes
   * @private
   */
  _getEdgesOverlappingWith(object, overlappingEdges) {
    const edges = this.body.edges;
    for (let i = 0; i < this.body.edgeIndices.length; i++) {
      const edgeId = this.body.edgeIndices[i];
      if (edges[edgeId].isOverlappingWith(object)) {
        overlappingEdges.push(edgeId);
      }
    }
  }


  /**
   * retrieve all nodes overlapping with given object
   * @param {Object} object  An object with parameters left, top, right, bottom
   * @return {number[]}   An array with id's of the overlapping nodes
   * @private
   */
  _getAllEdgesOverlappingWith(object) {
    const overlappingEdges = [];
    this._getEdgesOverlappingWith(object, overlappingEdges);
    return overlappingEdges;
  }


  /**
   * Get the edges nearest to the passed point (like a click)
   *
   * @param {{x: number, y: number}} pointer
   * @param {boolean} [returnEdge=true]
   * @return {Edge | undefined} node
   */
  getEdgeAt(pointer, returnEdge = true) {
    // Iterate over edges, pick closest within 10
    const canvasPos = this.canvas.DOMtoCanvas(pointer);
    let mindist = 10;
    let overlappingEdge = null;
    const edges = this.body.edges;
    for (let i = 0; i < this.body.edgeIndices.length; i++) {
      const edgeId = this.body.edgeIndices[i];
      const edge = edges[edgeId];
      if (edge.connected) {
        const xFrom = edge.from.x;
        const yFrom = edge.from.y;
        const xTo = edge.to.x;
        const yTo = edge.to.y;
        const dist = edge.edgeType.getDistanceToEdge(xFrom, yFrom, xTo, yTo, canvasPos.x, canvasPos.y);
        if (dist < mindist) {
          overlappingEdge = edgeId;
          mindist = dist;
        }
      }
    }
    if (overlappingEdge !== null) {
      if (returnEdge === true) {
        return this.body.edges[overlappingEdge];
      }
      else {
        return overlappingEdge;
      }
    }
    else {
      return undefined;
    }
  }


  /**
   * Add object to the selection array.
   *
   * @param {Object} obj
   * @private
   */
  _addToSelection(obj) {
    if (obj instanceof Node) {
      this.selectionObj.nodes[obj.id] = obj;
    }
    else {
      this.selectionObj.edges[obj.id] = obj;
    }
  }

  /**
   * Add object to the selection array.
   *
   * @param {Object} obj
   * @private
   */
  _addToHover(obj) {
    if (obj instanceof Node) {
      this.hoverObj.nodes[obj.id] = obj;
    }
    else {
      this.hoverObj.edges[obj.id] = obj;
    }
  }


  /**
   * Remove a single option from selection.
   *
   * @param {Object} obj
   * @private
   */
  _removeFromSelection(obj) {
    if (obj instanceof Node) {
      delete this.selectionObj.nodes[obj.id];
      this._unselectConnectedEdges(obj);
    }
    else {
      delete this.selectionObj.edges[obj.id];
    }
  }

  /**
   * Unselect all. The selectionObj is useful for this.
   */
  unselectAll() {
    for (const nodeId in this.selectionObj.nodes) {
      if (Object.prototype.hasOwnProperty.call(this.selectionObj.nodes, nodeId)) {
        this.selectionObj.nodes[nodeId].unselect();
      }
    }
    for (const edgeId in this.selectionObj.edges) {
      if (Object.prototype.hasOwnProperty.call(this.selectionObj.edges, edgeId)) {
        this.selectionObj.edges[edgeId].unselect();
      }
    }

    this.selectionObj = { nodes: {}, edges: {} };
  }


  /**
   * return the number of selected nodes
   *
   * @returns {number}
   * @private
   */
  _getSelectedNodeCount() {
    let count = 0;
    for (const nodeId in this.selectionObj.nodes) {
      if (Object.prototype.hasOwnProperty.call(this.selectionObj.nodes, nodeId)) {
        count += 1;
      }
    }
    return count;
  }

  /**
   * return the selected node
   *
   * @returns {number}
   * @private
   */
  _getSelectedNode() {
    for (const nodeId in this.selectionObj.nodes) {
      if (Object.prototype.hasOwnProperty.call(this.selectionObj.nodes, nodeId)) {
        return this.selectionObj.nodes[nodeId];
      }
    }
    return undefined;
  }

  /**
   * return the selected edge
   *
   * @returns {number}
   * @private
   */
  _getSelectedEdge() {
    for (const edgeId in this.selectionObj.edges) {
      if (Object.prototype.hasOwnProperty.call(this.selectionObj.edges, edgeId)) {
        return this.selectionObj.edges[edgeId];
      }
    }
    return undefined;
  }


  /**
   * return the number of selected edges
   *
   * @returns {number}
   * @private
   */
  _getSelectedEdgeCount() {
    let count = 0;
    for (const edgeId in this.selectionObj.edges) {
      if (Object.prototype.hasOwnProperty.call(this.selectionObj.edges, edgeId)) {
        count += 1;
      }
    }
    return count;
  }


  /**
   * return the number of selected objects.
   *
   * @returns {number}
   * @private
   */
  _getSelectedObjectCount() {
    let count = 0;
    for (const nodeId in this.selectionObj.nodes) {
      if (Object.prototype.hasOwnProperty.call(this.selectionObj.nodes, nodeId)) {
        count += 1;
      }
    }
    for (const edgeId in this.selectionObj.edges) {
      if (Object.prototype.hasOwnProperty.call(this.selectionObj.edges, edgeId)) {
        count += 1;
      }
    }
    return count;
  }

  /**
   * Check if anything is selected
   *
   * @returns {boolean}
   * @private
   */
  _selectionIsEmpty() {
    for (const nodeId in this.selectionObj.nodes) {
      if (Object.prototype.hasOwnProperty.call(this.selectionObj.nodes, nodeId)) {
        return false;
      }
    }
    for (const edgeId in this.selectionObj.edges) {
      if (Object.prototype.hasOwnProperty.call(this.selectionObj.edges, edgeId)) {
        return false;
      }
    }
    return true;
  }


  /**
   * check if one of the selected nodes is a cluster.
   *
   * @returns {boolean}
   * @private
   */
  _clusterInSelection() {
    for (const nodeId in this.selectionObj.nodes) {
      if (Object.prototype.hasOwnProperty.call(this.selectionObj.nodes, nodeId)) {
        if (this.selectionObj.nodes[nodeId].clusterSize > 1) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * select the edges connected to the node that is being selected
   *
   * @param {Node} node
   * @private
   */
  _selectConnectedEdges(node) {
    for (let i = 0; i < node.edges.length; i++) {
      const edge = node.edges[i];
      edge.select();
      this._addToSelection(edge);
    }
  }

  /**
   * select the edges connected to the node that is being selected
   *
   * @param {Node} node
   * @private
   */
  _hoverConnectedEdges(node) {
    for (let i = 0; i < node.edges.length; i++) {
      const edge = node.edges[i];
      edge.hover = true;
      this._addToHover(edge);
    }
  }


  /**
   * unselect the edges connected to the node that is being selected
   *
   * @param {Node} node
   * @private
   */
  _unselectConnectedEdges(node) {
    for (let i = 0; i < node.edges.length; i++) {
      const edge = node.edges[i];
      edge.unselect();
      this._removeFromSelection(edge);
    }
  }


  /**
   * Remove the highlight from a node or edge, in response to mouse movement
   *
   * @param {Event}  event
   * @param {{x: number, y: number}} pointer object with the x and y screen coordinates of the mouse
   * @param {Node|vis.Edge} object
   * @private
   */
  emitBlurEvent(event, pointer, object) {
    const properties = this._initBaseEvent(event, pointer);

    if (object.hover === true) {
      object.hover = false;
      if (object instanceof Node) {
        properties.node = object.id;
        this.body.emitter.emit("blurNode", properties);
      }
      else {
        properties.edge = object.id;
        this.body.emitter.emit("blurEdge", properties);
      }
    }
  }


  /**
   * Create the highlight for a node or edge, in response to mouse movement
   *
   * @param {Event}  event
   * @param {{x: number, y: number}} pointer object with the x and y screen coordinates of the mouse
   * @param {Node|vis.Edge} object
   * @returns {boolean} hoverChanged
   * @private
   */
  emitHoverEvent(event, pointer, object) {
    const properties = this._initBaseEvent(event, pointer);
    let hoverChanged = false;

    if (object.hover === false) {
      object.hover = true;
      this._addToHover(object);
      hoverChanged = true;
      if (object instanceof Node) {
        properties.node = object.id;
        this.body.emitter.emit("hoverNode", properties);
      }
      else {
        properties.edge = object.id;
        this.body.emitter.emit("hoverEdge", properties);
      }
    }

    return hoverChanged;
  }


  /**
   * Perform actions in response to a mouse movement.
   *
   * @param {Event}  event
   * @param {{x: number, y: number}} pointer | object with the x and y screen coordinates of the mouse
   */
  hoverObject(event, pointer) {
    let object = this.getNodeAt(pointer);
    if (object === undefined) {
      object = this.getEdgeAt(pointer);
    }

    let hoverChanged = false;
    // remove all node hover highlights
    for (const nodeId in this.hoverObj.nodes) {
      if (Object.prototype.hasOwnProperty.call(this.hoverObj.nodes, nodeId)) {
        if (object === undefined || (object instanceof Node && object.id != nodeId) || object instanceof Edge) {
          this.emitBlurEvent(event, pointer, this.hoverObj.nodes[nodeId]);
          delete this.hoverObj.nodes[nodeId];
          hoverChanged = true;
        }
      }
    }

    // removing all edge hover highlights
    for (const edgeId in this.hoverObj.edges) {
      if (Object.prototype.hasOwnProperty.call(this.hoverObj.edges, edgeId)) {
        // if the hover has been changed here it means that the node has been hovered over or off
        // we then do not use the emitBlurEvent method here.
        if (hoverChanged === true) {
          this.hoverObj.edges[edgeId].hover = false;
          delete this.hoverObj.edges[edgeId];
        }
        // if the blur remains the same and the object is undefined (mouse off) or another
        // edge has been hovered, or another node has been hovered we blur the edge.
        else if (object === undefined || (object instanceof Edge && object.id != edgeId) || (object instanceof Node && !object.hover)) {
          this.emitBlurEvent(event, pointer, this.hoverObj.edges[edgeId]);
          delete this.hoverObj.edges[edgeId];
          hoverChanged = true;
        }
      }
    }

    if (object !== undefined) {
      const hoveredEdgesCount = Object.keys(this.hoverObj.edges).length;
      const hoveredNodesCount = Object.keys(this.hoverObj.nodes).length;
      const newOnlyHoveredEdge = object instanceof Edge && hoveredEdgesCount === 0 && hoveredNodesCount === 0;
      const newOnlyHoveredNode = object instanceof Node && hoveredEdgesCount === 0 && hoveredNodesCount === 0;

      if (hoverChanged || newOnlyHoveredEdge || newOnlyHoveredNode) {
        hoverChanged = this.emitHoverEvent(event, pointer, object);
      }

      if (object instanceof Node && this.options.hoverConnectedEdges === true) {
        this._hoverConnectedEdges(object);
      }
    }

    if (hoverChanged === true) {
      this.body.emitter.emit('_requestRedraw');
    }
  }




  /**
   *
   * retrieve the currently selected objects
   * @return {{nodes: Array.<string>, edges: Array.<string>}} selection
   */
  getSelection() {
    const nodeIds = this.getSelectedNodes();
    const edgeIds = this.getSelectedEdges();
    return { nodes: nodeIds, edges: edgeIds };
  }

  /**
   *
   * retrieve the currently selected nodes
   * @return {string[]} selection    An array with the ids of the
   *                                            selected nodes.
   */
  getSelectedNodes() {
    const idArray = [];
    if (this.options.selectable === true) {
      for (const nodeId in this.selectionObj.nodes) {
        if (Object.prototype.hasOwnProperty.call(this.selectionObj.nodes, nodeId)) {
          idArray.push(this.selectionObj.nodes[nodeId].id);
        }
      }
    }
    return idArray;
  }

  /**
   *
   * retrieve the currently selected edges
   * @return {Array} selection    An array with the ids of the
   *                                            selected nodes.
   */
  getSelectedEdges() {
    const idArray = [];
    if (this.options.selectable === true) {
      for (const edgeId in this.selectionObj.edges) {
        if (Object.prototype.hasOwnProperty.call(this.selectionObj.edges, edgeId)) {
          idArray.push(this.selectionObj.edges[edgeId].id);
        }
      }
    }
    return idArray;
  }

  /**
   * Updates the current selection
   * @param {{nodes: Array.<string>, edges: Array.<string>}} selection
   * @param {Object} options                                 Options
   */
  setSelection(selection, options = {}) {
    let i, id;

    if (!selection || (!selection.nodes && !selection.edges))
      throw 'Selection must be an object with nodes and/or edges properties';
    // first unselect any selected node, if option is true or undefined
    if (options.unselectAll || options.unselectAll === undefined) {
      this.unselectAll();
    }
    if (selection.nodes) {
      for (i = 0; i < selection.nodes.length; i++) {
        id = selection.nodes[i];

        const node = this.body.nodes[id];
        if (!node) {
          throw new RangeError('Node with id "' + id + '" not found');
        }
        // don't select edges with it
        this.selectObject(node, options.highlightEdges);
      }
    }

    if (selection.edges) {
      for (i = 0; i < selection.edges.length; i++) {
        id = selection.edges[i];

        const edge = this.body.edges[id];
        if (!edge) {
          throw new RangeError('Edge with id "' + id + '" not found');
        }
        this.selectObject(edge);
      }
    }
    this.body.emitter.emit('_requestRedraw');
  }


  /**
   * select zero or more nodes with the option to highlight edges
   * @param {number[] | string[]} selection     An array with the ids of the
   *                                            selected nodes.
   * @param {boolean} [highlightEdges]
   */
  selectNodes(selection, highlightEdges = true) {
    if (!selection || (selection.length === undefined))
      throw 'Selection must be an array with ids';

    this.setSelection({ nodes: selection }, { highlightEdges: highlightEdges });
  }


  /**
   * select zero or more edges
   * @param {number[] | string[]} selection     An array with the ids of the
   *                                            selected nodes.
   */
  selectEdges(selection) {
    if (!selection || (selection.length === undefined))
      throw 'Selection must be an array with ids';

    this.setSelection({ edges: selection });
  }

  /**
   * Validate the selection: remove ids of nodes which no longer exist
   * @private
   */
  updateSelection() {
    for (const nodeId in this.selectionObj.nodes) {
      if (Object.prototype.hasOwnProperty.call(this.selectionObj.nodes, nodeId)) {
        if (!Object.prototype.hasOwnProperty.call(this.body.nodes, nodeId)) {
          delete this.selectionObj.nodes[nodeId];
        }
      }
    }
    for (const edgeId in this.selectionObj.edges) {
      if (Object.prototype.hasOwnProperty.call(this.selectionObj.edges, edgeId)) {
        if (!Object.prototype.hasOwnProperty.call(this.body.edges, edgeId)) {
          delete this.selectionObj.edges[edgeId];
        }
      }
    }
  }


  /**
   * Determine all the visual elements clicked which are on the given point.
   *
   * All elements are returned; this includes nodes, edges and their labels.
   * The order returned is from highest to lowest, i.e. element 0 of the return
   * value is the topmost item clicked on.
   *
   * The return value consists of an array of the following possible elements:
   *
   * - `{nodeId:number}`             - node with given id clicked on
   * - `{nodeId:number, labelId:0}`  - label of node with given id clicked on
   * - `{edgeId:number}`             - edge with given id clicked on
   * - `{edge:number, labelId:0}`    - label of edge with given id clicked on
   *
   * ## NOTES
   *
   * - Currently, there is only one label associated with a node or an edge,
   *   but this is expected to change somewhere in the future.
   * - Since there is no z-indexing yet, it is not really possible to set the nodes and
   *   edges in the correct order. For the time being, nodes come first.
   *
   * @param {point} pointer  mouse position in screen coordinates
   * @returns {Array.<nodeClickItem|nodeLabelClickItem|edgeClickItem|edgeLabelClickItem>}
   * @private
   */
  getClickedItems(pointer) {
    const point = this.canvas.DOMtoCanvas(pointer);
    const items = [];

    // Note reverse order; we want the topmost clicked items to be first in the array
    // Also note that selected nodes are disregarded here; these normally display on top
    const nodeIndices = this.body.nodeIndices;
    const nodes = this.body.nodes;
    for (let i = nodeIndices.length - 1; i >= 0; i--) {
      const node = nodes[nodeIndices[i]];
      const ret = node.getItemsOnPoint(point);
      items.push.apply(items, ret); // Append the return value to the running list.
    }

    const edgeIndices = this.body.edgeIndices;
    const edges = this.body.edges;
    for (let i = edgeIndices.length - 1; i >= 0; i--) {
      const edge = edges[edgeIndices[i]];
      const ret = edge.getItemsOnPoint(point);
      items.push.apply(items, ret); // Append the return value to the running list.
    }

    return items;
  }
}

export default SelectionHandler;
