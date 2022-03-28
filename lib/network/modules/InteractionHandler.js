import {
  Popup,
  getAbsoluteLeft,
  getAbsoluteTop,
  mergeOptions,
  parseColor,
  selectiveNotDeepExtend,
} from "vis-util/esnext";
import NavigationHandler from "./components/NavigationHandler";

/**
 * Handler for interactions
 */
class InteractionHandler {
  /**
   * @param {object} body
   * @param {Canvas} canvas
   * @param {SelectionHandler} selectionHandler
   */
  constructor(body, canvas, selectionHandler) {
    this.body = body;
    this.canvas = canvas;
    this.selectionHandler = selectionHandler;
    this.navigationHandler = new NavigationHandler(body, canvas);

    // bind the events from hammer to functions in this object
    this.body.eventListeners.onTap = this.onTap.bind(this);
    this.body.eventListeners.onTouch = this.onTouch.bind(this);
    this.body.eventListeners.onDoubleTap = this.onDoubleTap.bind(this);
    this.body.eventListeners.onHold = this.onHold.bind(this);
    this.body.eventListeners.onDragStart = this.onDragStart.bind(this);
    this.body.eventListeners.onDrag = this.onDrag.bind(this);
    this.body.eventListeners.onDragEnd = this.onDragEnd.bind(this);
    this.body.eventListeners.onMouseWheel = this.onMouseWheel.bind(this);
    this.body.eventListeners.onPinch = this.onPinch.bind(this);
    this.body.eventListeners.onMouseMove = this.onMouseMove.bind(this);
    this.body.eventListeners.onRelease = this.onRelease.bind(this);
    this.body.eventListeners.onContext = this.onContext.bind(this);

    this.touchTime = 0;
    this.drag = {};
    this.pinch = {};
    this.popup = undefined;
    this.popupObj = undefined;
    this.popupTimer = undefined;

    this.body.functions.getPointer = this.getPointer.bind(this);

    this.options = {};
    this.defaultOptions = {
      dragNodes: true,
      dragView: true,
      hover: false,
      keyboard: {
        enabled: false,
        speed: { x: 10, y: 10, zoom: 0.02 },
        bindToWindow: true,
        autoFocus: true,
      },
      navigationButtons: false,
      tooltipDelay: 300,
      zoomView: true,
      zoomSpeed: 1,
    };
    Object.assign(this.options, this.defaultOptions);

    this.bindEventListeners();
  }

  /**
   * Binds event listeners
   */
  bindEventListeners() {
    this.body.emitter.on("destroy", () => {
      clearTimeout(this.popupTimer);
      delete this.body.functions.getPointer;
    });
  }

  /**
   *
   * @param {object} options
   */
  setOptions(options) {
    if (options !== undefined) {
      // extend all but the values in fields
      const fields = [
        "hideEdgesOnDrag",
        "hideEdgesOnZoom",
        "hideNodesOnDrag",
        "keyboard",
        "multiselect",
        "selectable",
        "selectConnectedEdges",
      ];
      selectiveNotDeepExtend(fields, this.options, options);

      // merge the keyboard options in.
      mergeOptions(this.options, options, "keyboard");

      if (options.tooltip) {
        Object.assign(this.options.tooltip, options.tooltip);
        if (options.tooltip.color) {
          this.options.tooltip.color = parseColor(options.tooltip.color);
        }
      }
    }

    this.navigationHandler.setOptions(this.options);
  }

  /**
   * Get the pointer location from a touch location
   *
   * @param {{x: number, y: number}} touch
   * @returns {{x: number, y: number}} pointer
   * @private
   */
  getPointer(touch) {
    return {
      x: touch.x - getAbsoluteLeft(this.canvas.frame.canvas),
      y: touch.y - getAbsoluteTop(this.canvas.frame.canvas),
    };
  }

  /**
   * On start of a touch gesture, store the pointer
   *
   * @param {Event}  event   The event
   * @private
   */
  onTouch(event) {
    if (new Date().valueOf() - this.touchTime > 50) {
      this.drag.pointer = this.getPointer(event.center);
      this.drag.pinched = false;
      this.pinch.scale = this.body.view.scale;
      // to avoid double fireing of this event because we have two hammer instances. (on canvas and on frame)
      this.touchTime = new Date().valueOf();
    }
  }

  /**
   * handle tap/click event: select/unselect a node
   *
   * @param {Event} event
   * @private
   */
  onTap(event) {
    const pointer = this.getPointer(event.center);
    const multiselect =
      this.selectionHandler.options.multiselect &&
      (event.changedPointers[0].ctrlKey || event.changedPointers[0].metaKey);

    this.checkSelectionChanges(pointer, multiselect);

    this.selectionHandler.commitAndEmit(pointer, event);
    this.selectionHandler.generateClickEvent("click", event, pointer);
  }

  /**
   * handle doubletap event
   *
   * @param {Event} event
   * @private
   */
  onDoubleTap(event) {
    const pointer = this.getPointer(event.center);
    this.selectionHandler.generateClickEvent("doubleClick", event, pointer);
  }

  /**
   * handle long tap event: multi select nodes
   *
   * @param {Event} event
   * @private
   */
  onHold(event) {
    const pointer = this.getPointer(event.center);
    const multiselect = this.selectionHandler.options.multiselect;

    this.checkSelectionChanges(pointer, multiselect);

    this.selectionHandler.commitAndEmit(pointer, event);
    this.selectionHandler.generateClickEvent("click", event, pointer);
    this.selectionHandler.generateClickEvent("hold", event, pointer);
  }

  /**
   * handle the release of the screen
   *
   * @param {Event} event
   * @private
   */
  onRelease(event) {
    if (new Date().valueOf() - this.touchTime > 10) {
      const pointer = this.getPointer(event.center);
      this.selectionHandler.generateClickEvent("release", event, pointer);
      // to avoid double fireing of this event because we have two hammer instances. (on canvas and on frame)
      this.touchTime = new Date().valueOf();
    }
  }

  /**
   *
   * @param {Event} event
   */
  onContext(event) {
    const pointer = this.getPointer({ x: event.clientX, y: event.clientY });
    this.selectionHandler.generateClickEvent("oncontext", event, pointer);
  }

  /**
   * Select and deselect nodes depending current selection change.
   *
   * @param {{x: number, y: number}} pointer
   * @param {boolean} [add=false]
   */
  checkSelectionChanges(pointer, add = false) {
    if (add === true) {
      this.selectionHandler.selectAdditionalOnPoint(pointer);
    } else {
      this.selectionHandler.selectOnPoint(pointer);
    }
  }

  /**
   * Remove all node and edge id's from the first set that are present in the second one.
   *
   * @param {{nodes: Array.<Node>, edges: Array.<vis.Edge>}} firstSet
   * @param {{nodes: Array.<Node>, edges: Array.<vis.Edge>}} secondSet
   * @returns {{nodes: Array.<Node>, edges: Array.<vis.Edge>}}
   * @private
   */
  _determineDifference(firstSet, secondSet) {
    const arrayDiff = function (firstArr, secondArr) {
      const result = [];

      for (let i = 0; i < firstArr.length; i++) {
        const value = firstArr[i];
        if (secondArr.indexOf(value) === -1) {
          result.push(value);
        }
      }

      return result;
    };

    return {
      nodes: arrayDiff(firstSet.nodes, secondSet.nodes),
      edges: arrayDiff(firstSet.edges, secondSet.edges),
    };
  }

  /**
   * This function is called by onDragStart.
   * It is separated out because we can then overload it for the datamanipulation system.
   *
   * @param {Event} event
   * @private
   */
  onDragStart(event) {
    // if already dragging, do not start
    // this can happen on touch screens with multiple fingers
    if (this.drag.dragging) {
      return;
    }

    //in case the touch event was triggered on an external div, do the initial touch now.
    if (this.drag.pointer === undefined) {
      this.onTouch(event);
    }

    // note: drag.pointer is set in onTouch to get the initial touch location
    const node = this.selectionHandler.getNodeAt(this.drag.pointer);

    this.drag.dragging = true;
    this.drag.selection = [];
    this.drag.translation = Object.assign({}, this.body.view.translation); // copy the object
    this.drag.nodeId = undefined;

    if (event.srcEvent.shiftKey) {
      this.body.selectionBox.show = true;
      const pointer = this.getPointer(event.center);

      this.body.selectionBox.position.start = {
        x: this.canvas._XconvertDOMtoCanvas(pointer.x),
        y: this.canvas._YconvertDOMtoCanvas(pointer.y),
      };
      this.body.selectionBox.position.end = {
        x: this.canvas._XconvertDOMtoCanvas(pointer.x),
        y: this.canvas._YconvertDOMtoCanvas(pointer.y),
      };
    }

    if (node !== undefined && this.options.dragNodes === true) {
      this.drag.nodeId = node.id;
      // select the clicked node if not yet selected
      if (node.isSelected() === false) {
        this.selectionHandler.setSelection({ nodes: [node.id] });
      }

      // after select to contain the node
      this.selectionHandler.generateClickEvent(
        "dragStart",
        event,
        this.drag.pointer
      );

      // create an array with the selected nodes and their original location and status
      for (const node of this.selectionHandler.getSelectedNodes()) {
        const s = {
          id: node.id,
          node: node,

          // store original x, y, xFixed and yFixed, make the node temporarily Fixed
          x: node.x,
          y: node.y,
          xFixed: node.options.fixed.x,
          yFixed: node.options.fixed.y,
        };

        node.options.fixed.x = true;
        node.options.fixed.y = true;

        this.drag.selection.push(s);
      }
    } else {
      // fallback if no node is selected and thus the view is dragged.
      this.selectionHandler.generateClickEvent(
        "dragStart",
        event,
        this.drag.pointer,
        undefined,
        true
      );
    }
  }

  /**
   * handle drag event
   *
   * @param {Event} event
   * @private
   */
  onDrag(event) {
    if (this.drag.pinched === true) {
      return;
    }

    // remove the focus on node if it is focussed on by the focusOnNode
    this.body.emitter.emit("unlockNode");

    const pointer = this.getPointer(event.center);

    const selection = this.drag.selection;
    if (selection && selection.length && this.options.dragNodes === true) {
      this.selectionHandler.generateClickEvent("dragging", event, pointer);

      // calculate delta's and new location
      const deltaX = pointer.x - this.drag.pointer.x;
      const deltaY = pointer.y - this.drag.pointer.y;

      // update position of all selected nodes
      selection.forEach((selection) => {
        const node = selection.node;
        // only move the node if it was not fixed initially
        if (selection.xFixed === false) {
          node.x = this.canvas._XconvertDOMtoCanvas(
            this.canvas._XconvertCanvasToDOM(selection.x) + deltaX
          );
        }
        // only move the node if it was not fixed initially
        if (selection.yFixed === false) {
          node.y = this.canvas._YconvertDOMtoCanvas(
            this.canvas._YconvertCanvasToDOM(selection.y) + deltaY
          );
        }
      });

      // start the simulation of the physics
      this.body.emitter.emit("startSimulation");
    } else {
      // create selection box
      if (event.srcEvent.shiftKey) {
        this.selectionHandler.generateClickEvent(
          "dragging",
          event,
          pointer,
          undefined,
          true
        );

        // if the drag was not started properly because the click started outside the network div, start it now.
        if (this.drag.pointer === undefined) {
          this.onDragStart(event);
          return;
        }

        this.body.selectionBox.position.end = {
          x: this.canvas._XconvertDOMtoCanvas(pointer.x),
          y: this.canvas._YconvertDOMtoCanvas(pointer.y),
        };
        this.body.emitter.emit("_requestRedraw");
      }

      // move the network
      if (this.options.dragView === true && !event.srcEvent.shiftKey) {
        this.selectionHandler.generateClickEvent(
          "dragging",
          event,
          pointer,
          undefined,
          true
        );

        // if the drag was not started properly because the click started outside the network div, start it now.
        if (this.drag.pointer === undefined) {
          this.onDragStart(event);
          return;
        }

        const diffX = pointer.x - this.drag.pointer.x;
        const diffY = pointer.y - this.drag.pointer.y;

        this.body.view.translation = {
          x: this.drag.translation.x + diffX,
          y: this.drag.translation.y + diffY,
        };
        this.body.emitter.emit("_requestRedraw");
      }
    }
  }

  /**
   * handle drag start event
   *
   * @param {Event} event
   * @private
   */
  onDragEnd(event) {
    this.drag.dragging = false;

    if (this.body.selectionBox.show) {
      this.body.selectionBox.show = false;
      const selectionBoxPosition = this.body.selectionBox.position;
      const selectionBoxPositionMinMax = {
        minX: Math.min(
          selectionBoxPosition.start.x,
          selectionBoxPosition.end.x
        ),
        minY: Math.min(
          selectionBoxPosition.start.y,
          selectionBoxPosition.end.y
        ),
        maxX: Math.max(
          selectionBoxPosition.start.x,
          selectionBoxPosition.end.x
        ),
        maxY: Math.max(
          selectionBoxPosition.start.y,
          selectionBoxPosition.end.y
        ),
      };

      const toBeSelectedNodes = this.body.nodeIndices.filter((nodeId) => {
        const node = this.body.nodes[nodeId];
        return (
          node.x >= selectionBoxPositionMinMax.minX &&
          node.x <= selectionBoxPositionMinMax.maxX &&
          node.y >= selectionBoxPositionMinMax.minY &&
          node.y <= selectionBoxPositionMinMax.maxY
        );
      });

      toBeSelectedNodes.forEach((nodeId) =>
        this.selectionHandler.selectObject(this.body.nodes[nodeId])
      );

      const pointer = this.getPointer(event.center);
      this.selectionHandler.commitAndEmit(pointer, event);
      this.selectionHandler.generateClickEvent(
        "dragEnd",
        event,
        this.getPointer(event.center),
        undefined,
        true
      );
      this.body.emitter.emit("_requestRedraw");
    } else {
      const selection = this.drag.selection;
      if (selection && selection.length) {
        selection.forEach(function (s) {
          // restore original xFixed and yFixed
          s.node.options.fixed.x = s.xFixed;
          s.node.options.fixed.y = s.yFixed;
        });
        this.selectionHandler.generateClickEvent(
          "dragEnd",
          event,
          this.getPointer(event.center)
        );
        this.body.emitter.emit("startSimulation");
      } else {
        this.selectionHandler.generateClickEvent(
          "dragEnd",
          event,
          this.getPointer(event.center),
          undefined,
          true
        );
        this.body.emitter.emit("_requestRedraw");
      }
    }
  }

  /**
   * Handle pinch event
   *
   * @param {Event}  event   The event
   * @private
   */
  onPinch(event) {
    const pointer = this.getPointer(event.center);

    this.drag.pinched = true;
    if (this.pinch["scale"] === undefined) {
      this.pinch.scale = 1;
    }

    // TODO: enabled moving while pinching?
    const scale = this.pinch.scale * event.scale;
    this.zoom(scale, pointer);
  }

  /**
   * Zoom the network in or out
   *
   * @param {number} scale a number around 1, and between 0.01 and 10
   * @param {{x: number, y: number}} pointer    Position on screen
   * @private
   */
  zoom(scale, pointer) {
    if (this.options.zoomView === true) {
      const scaleOld = this.body.view.scale;
      if (scale < 0.00001) {
        scale = 0.00001;
      }
      if (scale > 10) {
        scale = 10;
      }

      let preScaleDragPointer = undefined;
      if (this.drag !== undefined) {
        if (this.drag.dragging === true) {
          preScaleDragPointer = this.canvas.DOMtoCanvas(this.drag.pointer);
        }
      }
      // + this.canvas.frame.canvas.clientHeight / 2
      const translation = this.body.view.translation;

      const scaleFrac = scale / scaleOld;
      const tx = (1 - scaleFrac) * pointer.x + translation.x * scaleFrac;
      const ty = (1 - scaleFrac) * pointer.y + translation.y * scaleFrac;

      this.body.view.scale = scale;
      this.body.view.translation = { x: tx, y: ty };

      if (preScaleDragPointer != undefined) {
        const postScaleDragPointer =
          this.canvas.canvasToDOM(preScaleDragPointer);
        this.drag.pointer.x = postScaleDragPointer.x;
        this.drag.pointer.y = postScaleDragPointer.y;
      }

      this.body.emitter.emit("_requestRedraw");

      if (scaleOld < scale) {
        this.body.emitter.emit("zoom", {
          direction: "+",
          scale: this.body.view.scale,
          pointer: pointer,
        });
      } else {
        this.body.emitter.emit("zoom", {
          direction: "-",
          scale: this.body.view.scale,
          pointer: pointer,
        });
      }
    }
  }

  /**
   * Event handler for mouse wheel event, used to zoom the timeline
   * See http://adomas.org/javascript-mouse-wheel/
   *     https://github.com/EightMedia/hammer.js/issues/256
   *
   * @param {MouseEvent}  event
   * @private
   */
  onMouseWheel(event) {
    if (this.options.zoomView === true) {
      // If delta is nonzero, handle it.
      // Basically, delta is now positive if wheel was scrolled up,
      // and negative, if wheel was scrolled down.
      if (event.deltaY !== 0) {
        // calculate the new scale
        let scale = this.body.view.scale;
        scale *=
          1 + (event.deltaY < 0 ? 1 : -1) * (this.options.zoomSpeed * 0.1);

        // calculate the pointer location
        const pointer = this.getPointer({ x: event.clientX, y: event.clientY });

        // apply the new scale
        this.zoom(scale, pointer);
      }

      // Prevent default actions caused by mouse wheel.
      event.preventDefault();
    }
  }

  /**
   * Mouse move handler for checking whether the title moves over a node with a title.
   *
   * @param  {Event} event
   * @private
   */
  onMouseMove(event) {
    const pointer = this.getPointer({ x: event.clientX, y: event.clientY });
    let popupVisible = false;

    // check if the previously selected node is still selected
    if (this.popup !== undefined) {
      if (this.popup.hidden === false) {
        this._checkHidePopup(pointer);
      }

      // if the popup was not hidden above
      if (this.popup.hidden === false) {
        popupVisible = true;
        this.popup.setPosition(pointer.x + 3, pointer.y - 5);
        this.popup.show();
      }
    }

    // if we bind the keyboard to the div, we have to highlight it to use it. This highlights it on mouse over.
    if (
      this.options.keyboard.autoFocus &&
      this.options.keyboard.bindToWindow === false &&
      this.options.keyboard.enabled === true
    ) {
      this.canvas.frame.focus();
    }

    // start a timeout that will check if the mouse is positioned above an element
    if (popupVisible === false) {
      if (this.popupTimer !== undefined) {
        clearInterval(this.popupTimer); // stop any running calculationTimer
        this.popupTimer = undefined;
      }
      if (!this.drag.dragging) {
        this.popupTimer = setTimeout(
          () => this._checkShowPopup(pointer),
          this.options.tooltipDelay
        );
      }
    }

    // adding hover highlights
    if (this.options.hover === true) {
      this.selectionHandler.hoverObject(event, pointer);
    }
  }

  /**
   * Check if there is an element on the given position in the network
   * (a node or edge). If so, and if this element has a title,
   * show a popup window with its title.
   *
   * @param {{x:number, y:number}} pointer
   * @private
   */
  _checkShowPopup(pointer) {
    const x = this.canvas._XconvertDOMtoCanvas(pointer.x);
    const y = this.canvas._YconvertDOMtoCanvas(pointer.y);
    const pointerObj = {
      left: x,
      top: y,
      right: x,
      bottom: y,
    };

    const previousPopupObjId =
      this.popupObj === undefined ? undefined : this.popupObj.id;
    let nodeUnderCursor = false;
    let popupType = "node";

    // check if a node is under the cursor.
    if (this.popupObj === undefined) {
      // search the nodes for overlap, select the top one in case of multiple nodes
      const nodeIndices = this.body.nodeIndices;
      const nodes = this.body.nodes;
      let node;
      const overlappingNodes = [];
      for (let i = 0; i < nodeIndices.length; i++) {
        node = nodes[nodeIndices[i]];
        if (node.isOverlappingWith(pointerObj) === true) {
          nodeUnderCursor = true;
          if (node.getTitle() !== undefined) {
            overlappingNodes.push(nodeIndices[i]);
          }
        }
      }

      if (overlappingNodes.length > 0) {
        // if there are overlapping nodes, select the last one, this is the one which is drawn on top of the others
        this.popupObj = nodes[overlappingNodes[overlappingNodes.length - 1]];
        // if you hover over a node, the title of the edge is not supposed to be shown.
        nodeUnderCursor = true;
      }
    }

    if (this.popupObj === undefined && nodeUnderCursor === false) {
      // search the edges for overlap
      const edgeIndices = this.body.edgeIndices;
      const edges = this.body.edges;
      let edge;
      const overlappingEdges = [];
      for (let i = 0; i < edgeIndices.length; i++) {
        edge = edges[edgeIndices[i]];
        if (edge.isOverlappingWith(pointerObj) === true) {
          if (edge.connected === true && edge.getTitle() !== undefined) {
            overlappingEdges.push(edgeIndices[i]);
          }
        }
      }

      if (overlappingEdges.length > 0) {
        this.popupObj = edges[overlappingEdges[overlappingEdges.length - 1]];
        popupType = "edge";
      }
    }

    if (this.popupObj !== undefined) {
      // show popup message window
      if (this.popupObj.id !== previousPopupObjId) {
        if (this.popup === undefined) {
          this.popup = new Popup(this.canvas.frame);
        }

        this.popup.popupTargetType = popupType;
        this.popup.popupTargetId = this.popupObj.id;

        // adjust a small offset such that the mouse cursor is located in the
        // bottom left location of the popup, and you can easily move over the
        // popup area
        this.popup.setPosition(pointer.x + 3, pointer.y - 5);
        this.popup.setText(this.popupObj.getTitle());
        this.popup.show();
        this.body.emitter.emit("showPopup", this.popupObj.id);
      }
    } else {
      if (this.popup !== undefined) {
        this.popup.hide();
        this.body.emitter.emit("hidePopup");
      }
    }
  }

  /**
   * Check if the popup must be hidden, which is the case when the mouse is no
   * longer hovering on the object
   *
   * @param {{x:number, y:number}} pointer
   * @private
   */
  _checkHidePopup(pointer) {
    const pointerObj = this.selectionHandler._pointerToPositionObject(pointer);

    let stillOnObj = false;
    if (this.popup.popupTargetType === "node") {
      if (this.body.nodes[this.popup.popupTargetId] !== undefined) {
        stillOnObj =
          this.body.nodes[this.popup.popupTargetId].isOverlappingWith(
            pointerObj
          );

        // if the mouse is still one the node, we have to check if it is not also on one that is drawn on top of it.
        // we initially only check stillOnObj because this is much faster.
        if (stillOnObj === true) {
          const overNode = this.selectionHandler.getNodeAt(pointer);
          stillOnObj =
            overNode === undefined
              ? false
              : overNode.id === this.popup.popupTargetId;
        }
      }
    } else {
      if (this.selectionHandler.getNodeAt(pointer) === undefined) {
        if (this.body.edges[this.popup.popupTargetId] !== undefined) {
          stillOnObj =
            this.body.edges[this.popup.popupTargetId].isOverlappingWith(
              pointerObj
            );
        }
      }
    }

    if (stillOnObj === false) {
      this.popupObj = undefined;
      this.popup.hide();
      this.body.emitter.emit("hidePopup");
    }
  }
}

export default InteractionHandler;
