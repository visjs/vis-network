'use strict';

import CircleImageBase from '../util/CircleImageBase'

/**
 * A CircularImage Node/Cluster shape.
 *
 * @extends CircleImageBase
 */
class CircularImage extends CircleImageBase {
  /**
   * @param {Object} options
   * @param {Object} body
   * @param {Label} labelModule
   * @param {Image} imageObj
   * @param {Image} imageObjAlt
   */
  constructor (options, body, labelModule, imageObj, imageObjAlt) {
    super(options, body, labelModule);

    this.setImages(imageObj, imageObjAlt);
  }

  /**
   *
   * @param {CanvasRenderingContext2D} ctx
   * @param {boolean} [selected]
   * @param {boolean} [hover]
   */
  resize(ctx, selected = this.selected, hover = this.hover) {
    var imageAbsent = (this.imageObj.src === undefined) ||
        (this.imageObj.width === undefined) ||
        (this.imageObj.height === undefined);

    if (imageAbsent) {
      var diameter = this.options.size * 2;
      this.width = diameter;
      this.height = diameter;
      this.radius = 0.5*this.width;
			return;
    }

    // At this point, an image is present, i.e. this.imageObj is valid.
    if (this.needsRefresh(selected, hover)) {
      this._resizeImage();
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
  draw(ctx, x, y, selected, hover, values) {
    this.switchImages(selected);
    this.resize();
    this.left = x - this.width / 2;
    this.top = y - this.height / 2;

    // draw the background circle. IMPORTANT: the stroke in this method is used by the clip method below.
    this._drawRawCircle(ctx, x, y, values);

    // now we draw in the circle, we save so we can revert the clip operation after drawing.
    ctx.save();
    // clip is used to use the stroke in drawRawCircle as an area that we can draw in.
    ctx.clip();
    // draw the image
    this._drawImageAtPosition(ctx, values);
    // restore so we can again draw on the full canvas
    ctx.restore();

    this._drawImageLabel(ctx, x, y, selected, hover);

    this.updateBoundingBox(x,y);
  }

  /**
   *
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} angle - Unused
   * @returns {number}
   */
  distanceToBorder(ctx, angle) {  // eslint-disable-line no-unused-vars
    if (ctx) {
      this.resize(ctx);
    }
    return this.width * 0.5;
  }
}

export default CircularImage;
