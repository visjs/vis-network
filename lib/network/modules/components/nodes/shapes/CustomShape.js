'use strict';

import NodeBase from '../util/NodeBase'

/**
 * A CustomShape Node/Cluster shape.
 *
 * @extends NodeBase
 */
class CustomShape extends NodeBase {
  /**
   * @param {Object} options
   * @param {Object} body
   * @param {Label} labelModule
   * @param {function} ctxRenderer
   */
  constructor (options, body, labelModule, ctxRenderer) {
    super(options,body,labelModule);
    this.ctxRenderer = ctxRenderer;
  }

    /**
   *
   * @param {CanvasRenderingContext2D} ctx
   * @param {boolean} [selected]
   * @param {boolean} [hover]
   */
  resize(ctx, selected = this.selected, hover = this.hover) {
    if (this.needsRefresh(selected, hover)) {
      // var dimensions = this.getDimensionsFromLabel(ctx, selected, hover);
      var dimensions = {
        width: 100,
        height: 100,
      }

      this.width  = dimensions.width;
      this.height = dimensions.height;
      this.radius = this.width / 2;
    }
  }

  /**
   *
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} x width
   * @param {number} y height
   * @param {boolean} selected
   * @param {boolean} hover
   * @param {ArrowOptions} values
   */
  draw(ctx, x, y, selected, hover) {
    this.left = x - this.width / 2;
    this.top = y - this.height / 2;
    this.ctxRenderer(ctx, this.left, this.top, this.width, this.height)
    this.updateBoundingBox(x, y, ctx, selected, hover);
  }

  /**
   *
   * @param {number} x width
   * @param {number} y height
   * @param {CanvasRenderingContext2D} ctx
   * @param {boolean} selected
   * @param {boolean} hover
   */
  updateBoundingBox(x, y, ctx, selected, hover) {
    this._updateBoundingBox(x, y, ctx, selected, hover);

    let borderRadius = this.options.shapeProperties.borderRadius; // only effective for CustomShape
    this._addBoundingBoxMargin(borderRadius);
  }

  /**
   *
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} angle
   * @returns {number}
   */
  distanceToBorder(ctx, angle) {
    let borderWidth = this.options.borderWidth;

    return Math.min(
        Math.abs((this.width) / 2 / Math.cos(angle)),
        Math.abs((this.height)  / 2 / Math.sin(angle))) + borderWidth;
  }
}

export default CustomShape;
