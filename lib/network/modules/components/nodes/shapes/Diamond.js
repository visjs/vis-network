"use strict";

import ShapeBase from "../util/ShapeBase";

/**
 * A Diamond Node/Cluster shape.
 *
 * @augments ShapeBase
 */
class Diamond extends ShapeBase {
  /**
   * @param {object} options
   * @param {object} body
   * @param {Label} labelModule
   */
  constructor(options, body, labelModule) {
    super(options, body, labelModule);
  }

  /**
   *
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} x width
   * @param {number} y height
   * @param {boolean} selected
   * @param {boolean} hover
   * @param {ArrowOptions} values
   * @returns {object} Callbacks to draw later on higher layers.
   */
  draw(ctx, x, y, selected, hover, values) {
    return this._drawShape(ctx, "diamond", 4, x, y, selected, hover, values);
  }

  /**
   *
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} angle
   * @returns {number}
   */
  distanceToBorder(ctx, angle) {
    return this._distanceToBorder(ctx, angle);
  }
}

export default Diamond;
