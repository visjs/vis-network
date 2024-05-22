import NodeBase from "./NodeBase";
import { drawCircle } from "./shapes";

/**
 * NOTE: This is a bad base class
 *
 * Child classes are:
 *
 *   Image       - uses *only* image methods
 *   Circle      - uses *only* _drawRawCircle
 *   CircleImage - uses all
 *
 * TODO: Refactor, move _drawRawCircle to different module, derive Circle from NodeBase
 *       Rename this to ImageBase
 *       Consolidate common code in Image and CircleImage to base class
 *
 * @augments NodeBase
 */
class CircleImageBase extends NodeBase {
  /**
   * @param {object} options
   * @param {object} body
   * @param {Label} labelModule
   */
  constructor(options, body, labelModule) {
    super(options, body, labelModule);
    this.labelOffset = 0;
    this.selected = false;
  }

  /**
   *
   * @param {object} options
   * @param {object} [imageObj]
   * @param {object} [imageObjAlt]
   */
  setOptions(options, imageObj, imageObjAlt) {
    this.options = options;

    if (!(imageObj === undefined && imageObjAlt === undefined)) {
      this.setImages(imageObj, imageObjAlt);
    }
  }

  /**
   * Set the images for this node.
   *
   * The images can be updated after the initial setting of options;
   * therefore, this method needs to be reentrant.
   *
   * For correct working in error cases, it is necessary to properly set
   * field 'nodes.brokenImage' in the options.
   *
   * @param {Image} imageObj  required; main image to show for this node
   * @param {Image|undefined} imageObjAlt optional; image to show when node is selected
   */
  setImages(imageObj, imageObjAlt) {
    if (imageObjAlt && this.selected) {
      this.imageObj = imageObjAlt;
      this.imageObjAlt = imageObj;
    } else {
      this.imageObj = imageObj;
      this.imageObjAlt = imageObjAlt;
    }
  }

  /**
   * Set selection and switch between the base and the selected image.
   *
   * Do the switch only if imageObjAlt exists.
   *
   * @param {boolean} selected value of new selected state for current node
   */
  switchImages(selected) {
    const selection_changed =
      (selected && !this.selected) || (!selected && this.selected);
    this.selected = selected; // Remember new selection

    if (this.imageObjAlt !== undefined && selection_changed) {
      const imageTmp = this.imageObj;
      this.imageObj = this.imageObjAlt;
      this.imageObjAlt = imageTmp;
    }
  }

  /**
   * Returns Image Padding from node options
   *
   * @returns {{top: number,left: number,bottom: number,right: number}} image padding inside this shape
   * @private
   */
  _getImagePadding() {
    const imgPadding = { top: 0, right: 0, bottom: 0, left: 0 };
    if (this.options.imagePadding) {
      const optImgPadding = this.options.imagePadding;
      if (typeof optImgPadding == "object") {
        imgPadding.top = optImgPadding.top;
        imgPadding.right = optImgPadding.right;
        imgPadding.bottom = optImgPadding.bottom;
        imgPadding.left = optImgPadding.left;
      } else {
        imgPadding.top = optImgPadding;
        imgPadding.right = optImgPadding;
        imgPadding.bottom = optImgPadding;
        imgPadding.left = optImgPadding;
      }
    }

    return imgPadding;
  }

  /**
   * Adjust the node dimensions for a loaded image.
   *
   * Pre: this.imageObj is valid
   */
  _resizeImage() {
    let width, height;

    if (this.options.shapeProperties.useImageSize === false) {
      // Use the size property
      let ratio_width = 1;
      let ratio_height = 1;

      // Only calculate the proper ratio if both width and height not zero
      if (this.imageObj.width && this.imageObj.height) {
        if (this.imageObj.width > this.imageObj.height) {
          ratio_width = this.imageObj.width / this.imageObj.height;
        } else {
          ratio_height = this.imageObj.height / this.imageObj.width;
        }
      }

      width = this.options.size * 2 * ratio_width;
      height = this.options.size * 2 * ratio_height;
    } else {
      // Use the image size with image padding
      const imgPadding = this._getImagePadding();
      width = this.imageObj.width + imgPadding.left + imgPadding.right;
      height = this.imageObj.height + imgPadding.top + imgPadding.bottom;
    }

    this.width = width;
    this.height = height;
    this.radius = 0.5 * this.width;
  }

  /**
   *
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} x width
   * @param {number} y height
   * @param {ArrowOptions} values
   * @private
   */
  _drawRawCircle(ctx, x, y, values) {
    this.initContextForDraw(ctx, values);
    drawCircle(ctx, x, y, values.size);
    this.performFill(ctx, values);
  }

  /**
   *
   * @param {CanvasRenderingContext2D} ctx
   * @param {ArrowOptions} values
   * @private
   */
  _drawImageAtPosition(ctx, values) {
    if (this.imageObj.width != 0) {
      // draw the image
      ctx.globalAlpha = values.opacity !== undefined ? values.opacity : 1;

      // draw shadow if enabled
      this.enableShadow(ctx, values);

      let factor = 1;
      if (this.options.shapeProperties.interpolation === true) {
        factor = this.imageObj.width / this.width / this.body.view.scale;
      }

      const imgPadding = this._getImagePadding();

      const imgPosLeft = this.left + imgPadding.left;
      const imgPosTop = this.top + imgPadding.top;
      const imgWidth = this.width - imgPadding.left - imgPadding.right;
      const imgHeight = this.height - imgPadding.top - imgPadding.bottom;
      this.imageObj.drawImageAtPosition(
        ctx,
        factor,
        imgPosLeft,
        imgPosTop,
        imgWidth,
        imgHeight
      );

      // disable shadows for other elements.
      this.disableShadow(ctx, values);
    }
  }

  /**
   *
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} x width
   * @param {number} y height
   * @param {boolean} selected
   * @param {boolean} hover
   * @private
   */
  _drawImageLabel(ctx, x, y, selected, hover) {
    let offset = 0;

    if (this.height !== undefined) {
      offset = this.height * 0.5;
      const labelDimensions = this.labelModule.getTextSize(
        ctx,
        selected,
        hover
      );
      if (labelDimensions.lineCount >= 1) {
        offset += labelDimensions.height / 2;
      }
    }

    const yLabel = y + offset;

    if (this.options.label) {
      this.labelOffset = offset;
    }
    this.labelModule.draw(ctx, x, yLabel, selected, hover, "hanging");
  }
}

export default CircleImageBase;
