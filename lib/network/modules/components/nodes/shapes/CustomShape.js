'use strict';

import ShapeBase from '../util/ShapeBase'

/**
 * A Hexagon Node/Cluster shape.
 *
 * @extends ShapeBase
 */
class Hexagon extends ShapeBase {
  /**
   * @param {Object} options
   * @param {Object} body
   * @param {Label} labelModule
   * @param {function} ctxRenderer

   */
  constructor(options, body, labelModule, ctxRenderer) {
    super(options, body, labelModule, ctxRenderer);
    this.ctxRenderer = ctxRenderer;
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
  draw(ctx, x, y, selected, hover, values) {
    this._drawShape(ctx, 'custom', 4, x, y, selected, hover, values, this.ctxRenderer);
  }

  /**
   *
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} angle
   * @returns {number}
   */
  distanceToBorder(ctx, angle) {
    return this._distanceToBorder(ctx,angle);
  }
}

export default Hexagon;
