import { selectiveDeepExtend } from "vis-util/esnext";

/**
 * The canvas renderer
 */
class CanvasRenderer {
  /**
   * @param {object} body
   * @param {Canvas} canvas
   */
  constructor(body, canvas) {
    this.body = body;
    this.canvas = canvas;

    this.redrawRequested = false;
    this.requestAnimationFrameRequestId = undefined;
    this.renderingActive = false;
    this.renderRequests = 0;
    this.allowRedraw = true;

    this.dragging = false;
    this.zooming = false;
    this.options = {};
    this.defaultOptions = {
      hideEdgesOnDrag: false,
      hideEdgesOnZoom: false,
      hideNodesOnDrag: false,
    };
    Object.assign(this.options, this.defaultOptions);

    this.bindEventListeners();
  }

  /**
   * Binds event listeners
   */
  bindEventListeners() {
    this.body.emitter.on("dragStart", () => {
      this.dragging = true;
    });
    this.body.emitter.on("dragEnd", () => {
      this.dragging = false;
    });
    this.body.emitter.on("zoom", () => {
      this.zooming = true;
      window.clearTimeout(this.zoomTimeoutId);
      this.zoomTimeoutId = window.setTimeout(() => {
        this.zooming = false;
        this._requestRedraw.bind(this)();
      }, 250);
    });
    this.body.emitter.on("_resizeNodes", () => {
      this._resizeNodes();
    });
    this.body.emitter.on("_redraw", () => {
      if (this.renderingActive === false) {
        this._redraw();
      }
    });
    this.body.emitter.on("_blockRedraw", () => {
      this.allowRedraw = false;
    });
    this.body.emitter.on("_allowRedraw", () => {
      this.allowRedraw = true;
      this.redrawRequested = false;
    });
    this.body.emitter.on("_requestRedraw", this._requestRedraw.bind(this));
    this.body.emitter.on("_startRendering", () => {
      this.renderRequests += 1;
      this.renderingActive = true;
      this._startRendering();
    });
    this.body.emitter.on("_stopRendering", () => {
      this.renderRequests -= 1;
      this.renderingActive = this.renderRequests > 0;
      this.requestAnimationFrameRequestId = undefined;
    });
    this.body.emitter.on("destroy", () => {
      this.renderRequests = 0;
      this.allowRedraw = false;
      this.renderingActive = false;
      window.cancelAnimationFrame(this.requestAnimationFrameRequestId);
      this.body.emitter.off();
    });
  }

  /**
   *
   * @param {object} options
   */
  setOptions(options) {
    if (options !== undefined) {
      const fields = ["hideEdgesOnDrag", "hideEdgesOnZoom", "hideNodesOnDrag"];
      selectiveDeepExtend(fields, this.options, options);
    }
  }

  /**
   *
   * @private
   */
  _startRendering() {
    if (this.renderingActive === true) {
      if (this.requestAnimationFrameRequestId === undefined) {
        this.requestAnimationFrameRequestId = window.requestAnimationFrame(
          this._renderStep.bind(this),
          this.simulationInterval,
        );
      }
    }
  }

  /**
   *
   * @private
   */
  _renderStep() {
    if (this.renderingActive === true) {
      // reset the requestAnimationFrameRequestId so a new scheduled animation step can be set
      this.requestAnimationFrameRequestId = undefined;

      // this schedules a new simulation step
      this._startRendering();

      this._redraw();
    }
  }

  /**
   * Redraw the network with the current data
   * chart will be resized too.
   */
  redraw() {
    this.body.emitter.emit("setSize");
    this._redraw();
  }

  /**
   * Redraw the network with the current data
   * @private
   */
  _requestRedraw() {
    if (
      this.redrawRequested !== true &&
      this.renderingActive === false &&
      this.allowRedraw === true
    ) {
      this.redrawRequested = true;
      window.requestAnimationFrame(() => {
        this._redraw(false);
      });
    }
  }

  /**
   * Redraw the network with the current data
   * @param {boolean} [hidden] | Used to get the first estimate of the node sizes.
   *                                   Only the nodes are drawn after which they are quickly drawn over.
   * @private
   */
  _redraw(hidden = false) {
    if (this.allowRedraw === true) {
      this.body.emitter.emit("initRedraw");

      this.redrawRequested = false;

      const drawLater = {
        drawExternalLabels: null,
      };

      // when the container div was hidden, this fixes it back up!
      if (
        this.canvas.frame.canvas.width === 0 ||
        this.canvas.frame.canvas.height === 0
      ) {
        this.canvas.setSize();
      }

      this.canvas.setTransform();

      const ctx = this.canvas.getContext();

      // clear the canvas
      const w = this.canvas.frame.canvas.clientWidth;
      const h = this.canvas.frame.canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);

      // if the div is hidden, we stop the redraw here for performance.
      if (this.canvas.frame.clientWidth === 0) {
        return;
      }

      // set scaling and translation
      ctx.save();
      ctx.translate(this.body.view.translation.x, this.body.view.translation.y);
      ctx.scale(this.body.view.scale, this.body.view.scale);

      ctx.beginPath();
      this.body.emitter.emit("beforeDrawing", ctx);
      ctx.closePath();

      if (hidden === false) {
        if (
          (this.dragging === false ||
            (this.dragging === true &&
              this.options.hideEdgesOnDrag === false)) &&
          (this.zooming === false ||
            (this.zooming === true && this.options.hideEdgesOnZoom === false))
        ) {
          this._drawEdges(ctx);
        }
      }

      if (
        this.dragging === false ||
        (this.dragging === true && this.options.hideNodesOnDrag === false)
      ) {
        const { drawExternalLabels } = this._drawNodes(ctx, hidden);
        drawLater.drawExternalLabels = drawExternalLabels;
      }

      // draw the arrows last so they will be at the top
      if (hidden === false) {
        if (
          (this.dragging === false ||
            (this.dragging === true &&
              this.options.hideEdgesOnDrag === false)) &&
          (this.zooming === false ||
            (this.zooming === true && this.options.hideEdgesOnZoom === false))
        ) {
          this._drawArrows(ctx);
        }
      }

      if (drawLater.drawExternalLabels != null) {
        drawLater.drawExternalLabels();
      }

      if (hidden === false) {
        this._drawSelectionBox(ctx);
      }

      ctx.beginPath();
      this.body.emitter.emit("afterDrawing", ctx);
      ctx.closePath();

      // restore original scaling and translation
      ctx.restore();
      if (hidden === true) {
        ctx.clearRect(0, 0, w, h);
      }
    }
  }

  /**
   * Redraw all nodes
   * @param {CanvasRenderingContext2D}   ctx
   * @param {boolean} [alwaysShow]
   * @private
   */
  _resizeNodes() {
    this.canvas.setTransform();
    const ctx = this.canvas.getContext();
    ctx.save();
    ctx.translate(this.body.view.translation.x, this.body.view.translation.y);
    ctx.scale(this.body.view.scale, this.body.view.scale);

    const nodes = this.body.nodes;
    let node;

    // resize all nodes
    for (const nodeId in nodes) {
      if (Object.prototype.hasOwnProperty.call(nodes, nodeId)) {
        node = nodes[nodeId];
        node.resize(ctx);
        node.updateBoundingBox(ctx, node.selected);
      }
    }

    // restore original scaling and translation
    ctx.restore();
  }

  /**
   * Redraw all nodes
   * @param {CanvasRenderingContext2D} ctx  2D context of a HTML canvas
   * @param {boolean} [alwaysShow]
   * @private
   * @returns {object} Callbacks to draw later on higher layers.
   */
  _drawNodes(ctx, alwaysShow = false) {
    const nodes = this.body.nodes;
    const nodeIndices = this.body.nodeIndices;
    let node;
    const selected = [];
    const hovered = [];
    const margin = 20;
    const topLeft = this.canvas.DOMtoCanvas({ x: -margin, y: -margin });
    const bottomRight = this.canvas.DOMtoCanvas({
      x: this.canvas.frame.canvas.clientWidth + margin,
      y: this.canvas.frame.canvas.clientHeight + margin,
    });
    const viewableArea = {
      top: topLeft.y,
      left: topLeft.x,
      bottom: bottomRight.y,
      right: bottomRight.x,
    };

    const drawExternalLabels = [];

    // draw unselected nodes;
    for (let i = 0; i < nodeIndices.length; i++) {
      node = nodes[nodeIndices[i]];
      // set selected and hovered nodes aside
      if (node.hover) {
        hovered.push(nodeIndices[i]);
      } else if (node.isSelected()) {
        selected.push(nodeIndices[i]);
      } else {
        if (alwaysShow === true) {
          const drawLater = node.draw(ctx);
          if (drawLater.drawExternalLabel != null) {
            drawExternalLabels.push(drawLater.drawExternalLabel);
          }
        } else if (node.isBoundingBoxOverlappingWith(viewableArea) === true) {
          const drawLater = node.draw(ctx);
          if (drawLater.drawExternalLabel != null) {
            drawExternalLabels.push(drawLater.drawExternalLabel);
          }
        } else {
          node.updateBoundingBox(ctx, node.selected);
        }
      }
    }

    let i;
    const selectedLength = selected.length;
    const hoveredLength = hovered.length;

    // draw the selected nodes on top
    for (i = 0; i < selectedLength; i++) {
      node = nodes[selected[i]];
      const drawLater = node.draw(ctx);
      if (drawLater.drawExternalLabel != null) {
        drawExternalLabels.push(drawLater.drawExternalLabel);
      }
    }

    // draw hovered nodes above everything else: fixes https://github.com/visjs/vis-network/issues/226
    for (i = 0; i < hoveredLength; i++) {
      node = nodes[hovered[i]];
      const drawLater = node.draw(ctx);
      if (drawLater.drawExternalLabel != null) {
        drawExternalLabels.push(drawLater.drawExternalLabel);
      }
    }

    return {
      drawExternalLabels: () => {
        for (const draw of drawExternalLabels) {
          draw();
        }
      },
    };
  }

  /**
   * Redraw all edges
   * @param {CanvasRenderingContext2D} ctx  2D context of a HTML canvas
   * @private
   */
  _drawEdges(ctx) {
    const edges = this.body.edges;
    const edgeIndices = this.body.edgeIndices;

    for (let i = 0; i < edgeIndices.length; i++) {
      const edge = edges[edgeIndices[i]];
      if (edge.connected === true) {
        edge.draw(ctx);
      }
    }
  }

  /**
   * Redraw all arrows
   * @param {CanvasRenderingContext2D} ctx  2D context of a HTML canvas
   * @private
   */
  _drawArrows(ctx) {
    const edges = this.body.edges;
    const edgeIndices = this.body.edgeIndices;

    for (let i = 0; i < edgeIndices.length; i++) {
      const edge = edges[edgeIndices[i]];
      if (edge.connected === true) {
        edge.drawArrows(ctx);
      }
    }
  }

  /**
   * Redraw selection box
   * @param {CanvasRenderingContext2D} ctx  2D context of a HTML canvas
   * @private
   */
  _drawSelectionBox(ctx) {
    if (this.body.selectionBox.show) {
      ctx.beginPath();
      const width =
        this.body.selectionBox.position.end.x -
        this.body.selectionBox.position.start.x;
      const height =
        this.body.selectionBox.position.end.y -
        this.body.selectionBox.position.start.y;
      ctx.rect(
        this.body.selectionBox.position.start.x,
        this.body.selectionBox.position.start.y,
        width,
        height,
      );
      ctx.fillStyle = "rgba(151, 194, 252, 0.2)";
      ctx.fillRect(
        this.body.selectionBox.position.start.x,
        this.body.selectionBox.position.start.y,
        width,
        height,
      );
      ctx.strokeStyle = "rgba(151, 194, 252, 1)";
      ctx.stroke();
    } else {
      ctx.closePath();
    }
  }
}

export default CanvasRenderer;
