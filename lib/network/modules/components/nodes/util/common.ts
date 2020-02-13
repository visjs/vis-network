export interface BoundingBox {
  bottom: number;
  left: number;
  right: number;
  top: number;
}

/**
 * Prepare final bounding box from the size of the shape, label and the
 * position of the node.
 *
 * @param x - The position of the node on X axis.
 * @param y - The position of the node on Y axis.
 * @param width - The width of the shape.
 * @param height - The height of the shape.
 * @param labelModule - The label module managing the label for given node.
 * @param margin - Optional margin to be added to the final bounding box.
 *
 * @returns A bounding box computed from the aforementioned arguments.
 */
export function prepareBoundingBox(
  x: number,
  y: number,
  width: number,
  height: number,
  labelModule: {
    label: string;
    size: {
      left: number;
      top: number;
      width: number;
      height: number;
    };
  },
  margin: BoundingBox = {
    bottom: 0,
    left: 0,
    right: 0,
    top: 0
  }
): BoundingBox {
  const shapeTop = y - height / 2;
  const shapeLeft = x - width / 2;
  const shapeRight = x + width / 2;
  const shapeBottom = y + height / 2;

  return typeof labelModule.label !== "undefined" && labelModule.size.width > 0
    ? {
        bottom:
          margin.bottom +
          Math.max(shapeBottom, labelModule.size.top + labelModule.size.height),
        left: -margin.left + Math.min(shapeLeft, labelModule.size.left),
        right:
          margin.right +
          Math.max(shapeRight, labelModule.size.left + labelModule.size.width),
        top: -margin.top + Math.min(shapeTop, labelModule.size.top)
      }
    : {
        bottom: margin.bottom + shapeBottom,
        left: -margin.left + shapeTop,
        right: margin.right + shapeRight,
        top: -margin.top + shapeLeft
      };
}
