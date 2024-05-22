"use strict";

import ShapeBase from "../util/ShapeBase";

/**
 * A CustomShape Node/Cluster shape.
 *
 * @augments ShapeBase
 */
class CustomShape extends ShapeBase {
  /**
   * @param {object} options
   * @param {object} body
   * @param {Label} labelModule
   * @param {Function} ctxRenderer
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
   * @returns {object} Callbacks to draw later on different layers.
   */
  draw(ctx, x, y, selected, hover, values) {
    this.resize(ctx, selected, hover, values);
    this.left = x - this.width / 2;
    this.top = y - this.height / 2;

    // Guard right away because someone may just draw in the function itself.
    ctx.save();
    const drawLater = this.ctxRenderer({
      ctx,
      id: this.options.id,
      x,
      y,
      state: { selected, hover },
      style: { ...values },
      label: this.options.label,
    });
    // Render the node shape bellow arrows.
    if (drawLater.drawNode != null) {
      drawLater.drawNode();
    }
    ctx.restore();

    if (drawLater.drawExternalLabel) {
      // Guard the external label (above arrows) drawing function.
      const drawExternalLabel = drawLater.drawExternalLabel;
      drawLater.drawExternalLabel = () => {
        ctx.save();
        drawExternalLabel();
        ctx.restore();
      };
    }

    if (drawLater.nodeDimensions) {
      this.customSizeWidth = drawLater.nodeDimensions.width;
      this.customSizeHeight = drawLater.nodeDimensions.height;
    }

    return drawLater;
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

export default CustomShape;
