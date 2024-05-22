"use strict";

import NodeBase from "../util/NodeBase";

/**
 * An icon replacement for the default Node shape.
 *
 * @augments NodeBase
 */
class Icon extends NodeBase {
  /**
   * @param {object} options
   * @param {object} body
   * @param {Label} labelModule
   */
  constructor(options, body, labelModule) {
    super(options, body, labelModule);
    this._setMargins(labelModule);
  }

  /**
   *
   * @param {CanvasRenderingContext2D} ctx - Unused.
   * @param {boolean} [selected]
   * @param {boolean} [hover]
   */
  resize(ctx, selected, hover) {
    if (this.needsRefresh(selected, hover)) {
      this.iconSize = {
        width: Number(this.options.icon.size),
        height: Number(this.options.icon.size),
      };
      this.width = this.iconSize.width + this.margin.right + this.margin.left;
      this.height = this.iconSize.height + this.margin.top + this.margin.bottom;
      this.radius = 0.5 * this.width;
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
   * @returns {object} Callbacks to draw later on higher layers.
   */
  draw(ctx, x, y, selected, hover, values) {
    this.resize(ctx, selected, hover);
    this.options.icon.size = this.options.icon.size || 50;

    this.left = x - this.width / 2;
    this.top = y - this.height / 2;
    this._icon(ctx, x, y, selected, hover, values);

    return {
      drawExternalLabel: () => {
        if (this.options.label !== undefined) {
          const iconTextSpacing = 5;
          this.labelModule.draw(
            ctx,
            this.left + this.iconSize.width / 2 + this.margin.left,
            y + this.height / 2 + iconTextSpacing,
            selected
          );
        }

        this.updateBoundingBox(x, y);
      },
    };
  }

  /**
   *
   * @param {number} x
   * @param {number} y
   */
  updateBoundingBox(x, y) {
    this.boundingBox.top = y - this.options.icon.size * 0.5;
    this.boundingBox.left = x - this.options.icon.size * 0.5;
    this.boundingBox.right = x + this.options.icon.size * 0.5;
    this.boundingBox.bottom = y + this.options.icon.size * 0.5;

    if (this.options.label !== undefined && this.labelModule.size.width > 0) {
      const iconTextSpacing = 5;
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
        this.boundingBox.bottom + this.labelModule.size.height + iconTextSpacing
      );
    }
  }

  /**
   *
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} x width
   * @param {number} y height
   * @param {boolean} selected
   * @param {boolean} hover - Unused
   * @param {ArrowOptions} values
   */
  _icon(ctx, x, y, selected, hover, values) {
    const iconSize = Number(this.options.icon.size);

    if (this.options.icon.code !== undefined) {
      ctx.font = [
        this.options.icon.weight != null
          ? this.options.icon.weight
          : selected
          ? "bold"
          : "",
        // If the weight is forced (for example to make Font Awesome 5 work
        // properly) substitute slightly bigger size for bold font face.
        (this.options.icon.weight != null && selected ? 5 : 0) +
          iconSize +
          "px",
        this.options.icon.face,
      ].join(" ");

      // draw icon
      ctx.fillStyle = this.options.icon.color || "black";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // draw shadow if enabled
      this.enableShadow(ctx, values);
      ctx.fillText(this.options.icon.code, x, y);

      // disable shadows for other elements.
      this.disableShadow(ctx, values);
    } else {
      console.error(
        "When using the icon shape, you need to define the code in the icon options object. This can be done per node or globally."
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

export default Icon;
