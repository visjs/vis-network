/**
 * ============================================================================
 * Location of all the endpoint drawing routines.
 *
 * Every endpoint has its own drawing routine, which contains an endpoint definition.
 *
 * The endpoint definitions must have the following properies:
 *
 * - (0,0) is the connection point to the node it attaches to
 * - The endpoints are orientated to the positive x-direction
 * - The length of the endpoint is at most 1
 *
 * As long as the endpoint classes remain simple and not too numerous, they will
 * be contained within this module.
 * All classes here except `EndPoints` should be considered as private to this module.
 *
 * -----------------------------------------------------------------------------
 * ### Further Actions
 *
 * After adding a new endpoint here, you also need to do the following things:
 *
 * - Add the new endpoint name to `network/options.js` in array `endPoints`.
 * - Add the new endpoint name to the documentation.
 *   Scan for 'arrows.to.type` and add it to the description.
 * - Add the endpoint to the examples. At the very least, add it to example
 *   `edgeStyles/arrowTypes`.
 * =============================================================================
 */

import { ArrowData, Point } from "./types";
import { drawCircle } from "./shapes";

/**
 * Common methods for endpoints
 *
 * @class
 */
class EndPoint {
  /**
   * Apply transformation on points for display.
   *
   * The following is done:
   * - rotate by the specified angle
   * - multiply the (normalized) coordinates by the passed length
   * - offset by the target coordinates
   *
   * @param points - The point(s) to be transformed.
   * @param arrowData - The data determining the result of the transformation.
   */
  public static transform(points: Point | Point[], arrowData: ArrowData): void {
    if (!Array.isArray(points)) {
      points = [points];
    }

    const x = arrowData.point.x;
    const y = arrowData.point.y;
    const angle = arrowData.angle;
    const length = arrowData.length;

    for (let i = 0; i < points.length; ++i) {
      const p = points[i];
      const xt = p.x * Math.cos(angle) - p.y * Math.sin(angle);
      const yt = p.x * Math.sin(angle) + p.y * Math.cos(angle);

      p.x = x + length * xt;
      p.y = y + length * yt;
    }
  }

  /**
   * Draw a closed path using the given real coordinates.
   *
   * @param ctx - The path will be rendered into this context.
   * @param points - The points of the path.
   */
  public static drawPath(ctx: CanvasRenderingContext2D, points: Point[]): void {
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; ++i) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.closePath();
  }
}

/**
 * Drawing methods for the arrow endpoint.
 */
class Image extends EndPoint {
  /**
   * Draw this shape at the end of a line.
   *
   * @param ctx - The shape will be rendered into this context.
   * @param arrowData - The data determining the shape.
   * @returns False as there is no way to fill an image.
   */
  public static draw(
    ctx: CanvasRenderingContext2D,
    arrowData: ArrowData
  ): false {
    if (arrowData.image) {
      ctx.save();

      ctx.translate(arrowData.point.x, arrowData.point.y);
      ctx.rotate(Math.PI / 2 + arrowData.angle);

      const width =
        arrowData.imageWidth != null
          ? arrowData.imageWidth
          : arrowData.image.width;
      const height =
        arrowData.imageHeight != null
          ? arrowData.imageHeight
          : arrowData.image.height;

      arrowData.image.drawImageAtPosition(
        ctx,
        1, // scale
        -width / 2, // x
        0, // y
        width,
        height
      );

      ctx.restore();
    }

    return false;
  }
}

/**
 * Drawing methods for the arrow endpoint.
 */
class Arrow extends EndPoint {
  /**
   * Draw this shape at the end of a line.
   *
   * @param ctx - The shape will be rendered into this context.
   * @param arrowData - The data determining the shape.
   * @returns True because ctx.fill() can be used to fill the arrow.
   */
  public static draw(
    ctx: CanvasRenderingContext2D,
    arrowData: ArrowData
  ): true {
    // Normalized points of closed path, in the order that they should be drawn.
    // (0, 0) is the attachment point, and the point around which should be rotated
    const points = [
      { x: 0, y: 0 },
      { x: -1, y: 0.3 },
      { x: -0.9, y: 0 },
      { x: -1, y: -0.3 },
    ];

    EndPoint.transform(points, arrowData);
    EndPoint.drawPath(ctx, points);

    return true;
  }
}

/**
 * Drawing methods for the crow endpoint.
 */
class Crow {
  /**
   * Draw this shape at the end of a line.
   *
   * @param ctx - The shape will be rendered into this context.
   * @param arrowData - The data determining the shape.
   * @returns True because ctx.fill() can be used to fill the arrow.
   */
  public static draw(
    ctx: CanvasRenderingContext2D,
    arrowData: ArrowData
  ): true {
    // Normalized points of closed path, in the order that they should be drawn.
    // (0, 0) is the attachment point, and the point around which should be rotated
    const points = [
      { x: -1, y: 0 },
      { x: 0, y: 0.3 },
      { x: -0.4, y: 0 },
      { x: 0, y: -0.3 },
    ];

    EndPoint.transform(points, arrowData);
    EndPoint.drawPath(ctx, points);

    return true;
  }
}

/**
 * Drawing methods for the curve endpoint.
 */
class Curve {
  /**
   * Draw this shape at the end of a line.
   *
   * @param ctx - The shape will be rendered into this context.
   * @param arrowData - The data determining the shape.
   * @returns True because ctx.fill() can be used to fill the arrow.
   */
  public static draw(
    ctx: CanvasRenderingContext2D,
    arrowData: ArrowData
  ): true {
    // Normalized points of closed path, in the order that they should be drawn.
    // (0, 0) is the attachment point, and the point around which should be rotated
    const point = { x: -0.4, y: 0 };
    EndPoint.transform(point, arrowData);

    // Update endpoint style for drawing transparent arc.
    ctx.strokeStyle = ctx.fillStyle;
    ctx.fillStyle = "rgba(0, 0, 0, 0)";

    // Define curve endpoint as semicircle.
    const pi = Math.PI;
    const startAngle = arrowData.angle - pi / 2;
    const endAngle = arrowData.angle + pi / 2;
    ctx.beginPath();
    ctx.arc(
      point.x,
      point.y,
      arrowData.length * 0.4,
      startAngle,
      endAngle,
      false
    );
    ctx.stroke();

    return true;
  }
}

/**
 * Drawing methods for the inverted curve endpoint.
 */
class InvertedCurve {
  /**
   * Draw this shape at the end of a line.
   *
   * @param ctx - The shape will be rendered into this context.
   * @param arrowData - The data determining the shape.
   * @returns True because ctx.fill() can be used to fill the arrow.
   */
  public static draw(
    ctx: CanvasRenderingContext2D,
    arrowData: ArrowData
  ): true {
    // Normalized points of closed path, in the order that they should be drawn.
    // (0, 0) is the attachment point, and the point around which should be rotated
    const point = { x: -0.3, y: 0 };
    EndPoint.transform(point, arrowData);

    // Update endpoint style for drawing transparent arc.
    ctx.strokeStyle = ctx.fillStyle;
    ctx.fillStyle = "rgba(0, 0, 0, 0)";

    // Define inverted curve endpoint as semicircle.
    const pi = Math.PI;
    const startAngle = arrowData.angle + pi / 2;
    const endAngle = arrowData.angle + (3 * pi) / 2;
    ctx.beginPath();
    ctx.arc(
      point.x,
      point.y,
      arrowData.length * 0.4,
      startAngle,
      endAngle,
      false
    );
    ctx.stroke();

    return true;
  }
}

/**
 * Drawing methods for the trinagle endpoint.
 */
class Triangle {
  /**
   * Draw this shape at the end of a line.
   *
   * @param ctx - The shape will be rendered into this context.
   * @param arrowData - The data determining the shape.
   * @returns True because ctx.fill() can be used to fill the arrow.
   */
  public static draw(
    ctx: CanvasRenderingContext2D,
    arrowData: ArrowData
  ): true {
    // Normalized points of closed path, in the order that they should be drawn.
    // (0, 0) is the attachment point, and the point around which should be rotated
    const points = [
      { x: 0.02, y: 0 },
      { x: -1, y: 0.3 },
      { x: -1, y: -0.3 },
    ];

    EndPoint.transform(points, arrowData);
    EndPoint.drawPath(ctx, points);

    return true;
  }
}

/**
 * Drawing methods for the inverted trinagle endpoint.
 */
class InvertedTriangle {
  /**
   * Draw this shape at the end of a line.
   *
   * @param ctx - The shape will be rendered into this context.
   * @param arrowData - The data determining the shape.
   * @returns True because ctx.fill() can be used to fill the arrow.
   */
  public static draw(
    ctx: CanvasRenderingContext2D,
    arrowData: ArrowData
  ): true {
    // Normalized points of closed path, in the order that they should be drawn.
    // (0, 0) is the attachment point, and the point around which should be rotated
    const points = [
      { x: 0, y: 0.3 },
      { x: 0, y: -0.3 },
      { x: -1, y: 0 },
    ];

    EndPoint.transform(points, arrowData);
    EndPoint.drawPath(ctx, points);

    return true;
  }
}

/**
 * Drawing methods for the circle endpoint.
 */
class Circle {
  /**
   * Draw this shape at the end of a line.
   *
   * @param ctx - The shape will be rendered into this context.
   * @param arrowData - The data determining the shape.
   * @returns True because ctx.fill() can be used to fill the arrow.
   */
  public static draw(
    ctx: CanvasRenderingContext2D,
    arrowData: ArrowData
  ): true {
    const point = { x: -0.4, y: 0 };

    EndPoint.transform(point, arrowData);
    drawCircle(ctx, point.x, point.y, arrowData.length * 0.4);

    return true;
  }
}

/**
 * Drawing methods for the bar endpoint.
 */
class Bar {
  /**
   * Draw this shape at the end of a line.
   *
   * @param ctx - The shape will be rendered into this context.
   * @param arrowData - The data determining the shape.
   * @returns True because ctx.fill() can be used to fill the arrow.
   */
  public static draw(
    ctx: CanvasRenderingContext2D,
    arrowData: ArrowData
  ): true {
    /*
    var points = [
      {x:0, y:0.5},
      {x:0, y:-0.5}
    ];

    EndPoint.transform(points, arrowData);
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    ctx.lineTo(points[1].x, points[1].y);
    ctx.stroke();
*/

    const points = [
      { x: 0, y: 0.5 },
      { x: 0, y: -0.5 },
      { x: -0.15, y: -0.5 },
      { x: -0.15, y: 0.5 },
    ];

    EndPoint.transform(points, arrowData);
    EndPoint.drawPath(ctx, points);

    return true;
  }
}

/**
 * Drawing methods for the box endpoint.
 */
class Box {
  /**
   * Draw this shape at the end of a line.
   *
   * @param ctx - The shape will be rendered into this context.
   * @param arrowData - The data determining the shape.
   * @returns True because ctx.fill() can be used to fill the arrow.
   */
  public static draw(
    ctx: CanvasRenderingContext2D,
    arrowData: ArrowData
  ): true {
    const points = [
      { x: 0, y: 0.3 },
      { x: 0, y: -0.3 },
      { x: -0.6, y: -0.3 },
      { x: -0.6, y: 0.3 },
    ];

    EndPoint.transform(points, arrowData);
    EndPoint.drawPath(ctx, points);

    return true;
  }
}

/**
 * Drawing methods for the diamond endpoint.
 */
class Diamond {
  /**
   * Draw this shape at the end of a line.
   *
   * @param ctx - The shape will be rendered into this context.
   * @param arrowData - The data determining the shape.
   * @returns True because ctx.fill() can be used to fill the arrow.
   */
  public static draw(
    ctx: CanvasRenderingContext2D,
    arrowData: ArrowData
  ): true {
    const points = [
      { x: 0, y: 0 },
      { x: -0.5, y: -0.3 },
      { x: -1, y: 0 },
      { x: -0.5, y: 0.3 },
    ];

    EndPoint.transform(points, arrowData);
    EndPoint.drawPath(ctx, points);

    return true;
  }
}

/**
 * Drawing methods for the vee endpoint.
 */
class Vee {
  /**
   * Draw this shape at the end of a line.
   *
   * @param ctx - The shape will be rendered into this context.
   * @param arrowData - The data determining the shape.
   * @returns True because ctx.fill() can be used to fill the arrow.
   */
  public static draw(
    ctx: CanvasRenderingContext2D,
    arrowData: ArrowData
  ): true {
    // Normalized points of closed path, in the order that they should be drawn.
    // (0, 0) is the attachment point, and the point around which should be rotated
    const points = [
      { x: -1, y: 0.3 },
      { x: -0.5, y: 0 },
      { x: -1, y: -0.3 },
      { x: 0, y: 0 },
    ];

    EndPoint.transform(points, arrowData);
    EndPoint.drawPath(ctx, points);

    return true;
  }
}

/**
 * Drawing methods for the endpoints.
 */
export class EndPoints {
  /**
   * Draw an endpoint.
   *
   * @param ctx - The shape will be rendered into this context.
   * @param arrowData - The data determining the shape.
   * @returns True if ctx.fill() can be used to fill the arrow, false otherwise.
   */
  public static draw(
    ctx: CanvasRenderingContext2D,
    arrowData: ArrowData
  ): boolean {
    let type;
    if (arrowData.type) {
      type = arrowData.type.toLowerCase();
    }

    switch (type) {
      case "image":
        return Image.draw(ctx, arrowData);
      case "circle":
        return Circle.draw(ctx, arrowData);
      case "box":
        return Box.draw(ctx, arrowData);
      case "crow":
        return Crow.draw(ctx, arrowData);
      case "curve":
        return Curve.draw(ctx, arrowData);
      case "diamond":
        return Diamond.draw(ctx, arrowData);
      case "inv_curve":
        return InvertedCurve.draw(ctx, arrowData);
      case "triangle":
        return Triangle.draw(ctx, arrowData);
      case "inv_triangle":
        return InvertedTriangle.draw(ctx, arrowData);
      case "bar":
        return Bar.draw(ctx, arrowData);
      case "vee":
        return Vee.draw(ctx, arrowData);
      case "arrow": // fall-through
      default:
        return Arrow.draw(ctx, arrowData);
    }
  }
}
