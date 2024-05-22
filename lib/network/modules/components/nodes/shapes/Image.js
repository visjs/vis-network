"use strict";

import CircleImageBase from "../util/CircleImageBase";
import { overrideOpacity } from "vis-util/esnext";

/**
 * An image-based replacement for the default Node shape.
 *
 * @augments CircleImageBase
 */
class Image extends CircleImageBase {
  /**
   * @param {object} options
   * @param {object} body
   * @param {Label} labelModule
   * @param {Image} imageObj
   * @param {Image} imageObjAlt
   */
  constructor(options, body, labelModule, imageObj, imageObjAlt) {
    super(options, body, labelModule);

    this.setImages(imageObj, imageObjAlt);
  }

  /**
   *
   * @param {CanvasRenderingContext2D} ctx - Unused.
   * @param {boolean} [selected]
   * @param {boolean} [hover]
   */
  resize(ctx, selected = this.selected, hover = this.hover) {
    const imageAbsent =
      this.imageObj.src === undefined ||
      this.imageObj.width === undefined ||
      this.imageObj.height === undefined;

    if (imageAbsent) {
      const side = this.options.size * 2;
      this.width = side;
      this.height = side;
      return;
    }

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
    ctx.save();
    this.switchImages(selected);
    this.resize();

    let labelX = x,
      labelY = y;

    if (this.options.shapeProperties.coordinateOrigin === "top-left") {
      this.left = x;
      this.top = y;
      labelX += this.width / 2;
      labelY += this.height / 2;
    } else {
      this.left = x - this.width / 2;
      this.top = y - this.height / 2;
    }

    if (this.options.shapeProperties.useBorderWithImage === true) {
      const neutralborderWidth = this.options.borderWidth;
      const selectionLineWidth =
        this.options.borderWidthSelected || 2 * this.options.borderWidth;
      const borderWidth =
        (selected ? selectionLineWidth : neutralborderWidth) /
        this.body.view.scale;
      ctx.lineWidth = Math.min(this.width, borderWidth);

      ctx.beginPath();
      let strokeStyle = selected
        ? this.options.color.highlight.border
        : hover
        ? this.options.color.hover.border
        : this.options.color.border;
      let fillStyle = selected
        ? this.options.color.highlight.background
        : hover
        ? this.options.color.hover.background
        : this.options.color.background;

      if (values.opacity !== undefined) {
        strokeStyle = overrideOpacity(strokeStyle, values.opacity);
        fillStyle = overrideOpacity(fillStyle, values.opacity);
      }
      // setup the line properties.
      ctx.strokeStyle = strokeStyle;

      // set a fillstyle
      ctx.fillStyle = fillStyle;

      // draw a rectangle to form the border around. This rectangle is filled so the opacity of a picture (in future vis releases?) can be used to tint the image
      ctx.rect(
        this.left - 0.5 * ctx.lineWidth,
        this.top - 0.5 * ctx.lineWidth,
        this.width + ctx.lineWidth,
        this.height + ctx.lineWidth
      );
      ctx.fill();

      this.performStroke(ctx, values);

      ctx.closePath();
    }

    this._drawImageAtPosition(ctx, values);

    this._drawImageLabel(ctx, labelX, labelY, selected, hover);

    this.updateBoundingBox(x, y);
    ctx.restore();
  }

  /**
   *
   * @param {number} x
   * @param {number} y
   */
  updateBoundingBox(x, y) {
    this.resize();

    if (this.options.shapeProperties.coordinateOrigin === "top-left") {
      this.left = x;
      this.top = y;
    } else {
      this.left = x - this.width / 2;
      this.top = y - this.height / 2;
    }

    this.boundingBox.left = this.left;
    this.boundingBox.top = this.top;
    this.boundingBox.bottom = this.top + this.height;
    this.boundingBox.right = this.left + this.width;

    if (this.options.label !== undefined && this.labelModule.size.width > 0) {
      this.boundingBox.left = Math.min(
        this.boundingBox.left,
        this.labelModule.size.left
      );
      this.boundingBox.right = Math.max(
        this.boundingBox.right,
        this.labelModule.size.left + this.labelModule.size.width
      );
      this.boundingBox.bottom = Math.max(
        this.boundingBox.bottom,
        this.boundingBox.bottom + this.labelOffset
      );
    }
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

export default Image;
