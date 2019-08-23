/** ============================================================================
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
 * ============================================================================= */

import { ArrowData, Point } from "./types";

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
class Arrow extends EndPoint {
  /**
   * Draw this shape at the end of a line.
   *
   * @param ctx - The shape will be rendered into this context.
   * @param arrowData - The data determining the shape.
   */
  public static draw(
    ctx: CanvasRenderingContext2D,
    arrowData: ArrowData
  ): void {
    // Normalized points of closed path, in the order that they should be drawn.
    // (0, 0) is the attachment point, and the point around which should be rotated
    const points = [
      { x: 0, y: 0 },
      { x: -1, y: 0.3 },
      { x: -0.9, y: 0 },
      { x: -1, y: -0.3 }
    ];

    EndPoint.transform(points, arrowData);
    EndPoint.drawPath(ctx, points);
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
   */
  public static draw(
    ctx: CanvasRenderingContext2D,
    arrowData: ArrowData
  ): void {
    // Normalized points of closed path, in the order that they should be drawn.
    // (0, 0) is the attachment point, and the point around which should be rotated
    const points = [
      { x: -1, y: 0 },
      { x: 0, y: 0.3 },
      { x: -0.4, y: 0 },
      { x: 0, y: -0.3 }
    ];

    EndPoint.transform(points, arrowData);
    EndPoint.drawPath(ctx, points);
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
   */
  public static draw(
    ctx: CanvasRenderingContext2D,
    arrowData: ArrowData
  ): void {
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
   */
  public static draw(
    ctx: CanvasRenderingContext2D,
    arrowData: ArrowData
  ): void {
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
   */
  public static draw(
    ctx: CanvasRenderingContext2D,
    arrowData: ArrowData
  ): void {
    // Normalized points of closed path, in the order that they should be drawn.
    // (0, 0) is the attachment point, and the point around which should be rotated
    const points = [{ x: 0.02, y: 0 }, { x: -1, y: 0.3 }, { x: -1, y: -0.3 }];

    EndPoint.transform(points, arrowData);
    EndPoint.drawPath(ctx, points);
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
   */
  public static draw(
    ctx: CanvasRenderingContext2D,
    arrowData: ArrowData
  ): void {
    // Normalized points of closed path, in the order that they should be drawn.
    // (0, 0) is the attachment point, and the point around which should be rotated
    const points = [{ x: 0, y: 0.3 }, { x: 0, y: -0.3 }, { x: -1, y: 0 }];

    EndPoint.transform(points, arrowData);
    EndPoint.drawPath(ctx, points);
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
   */
  public static draw(
    ctx: CanvasRenderingContext2D,
    arrowData: ArrowData
  ): void {
    const point = { x: -0.4, y: 0 };

    EndPoint.transform(point, arrowData);
    ctx.circle(point.x, point.y, arrowData.length * 0.4);
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
   */
  public static draw(
    ctx: CanvasRenderingContext2D,
    arrowData: ArrowData
  ): void {
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
      { x: -0.15, y: 0.5 }
    ];

    EndPoint.transform(points, arrowData);
    EndPoint.drawPath(ctx, points);
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
   */
  public static draw(
    ctx: CanvasRenderingContext2D,
    arrowData: ArrowData
  ): void {
    const points = [
      { x: 0, y: 0.3 },
      { x: 0, y: -0.3 },
      { x: -0.6, y: -0.3 },
      { x: -0.6, y: 0.3 }
    ];

    EndPoint.transform(points, arrowData);
    EndPoint.drawPath(ctx, points);
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
   */
  public static draw(
    ctx: CanvasRenderingContext2D,
    arrowData: ArrowData
  ): void {
    const points = [
      { x: 0, y: 0 },
      { x: -0.5, y: -0.3 },
      { x: -1, y: 0 },
      { x: -0.5, y: 0.3 }
    ];

    EndPoint.transform(points, arrowData);
    EndPoint.drawPath(ctx, points);
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
   */
  public static draw(
    ctx: CanvasRenderingContext2D,
    arrowData: ArrowData
  ): void {
    // Normalized points of closed path, in the order that they should be drawn.
    // (0, 0) is the attachment point, and the point around which should be rotated
    const points = [
      { x: -1, y: 0.3 },
      { x: -0.5, y: 0 },
      { x: -1, y: -0.3 },
      { x: 0, y: 0 }
    ];

    EndPoint.transform(points, arrowData);
    EndPoint.drawPath(ctx, points);
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
   */
  public static draw(
    ctx: CanvasRenderingContext2D,
    arrowData: ArrowData
  ): void {
    let type;
    if (arrowData.type) {
      type = arrowData.type.toLowerCase();
    }

    switch (type) {
      case "circle":
        Circle.draw(ctx, arrowData);
        break;
      case "box":
        Box.draw(ctx, arrowData);
        break;
      case "crow":
        Crow.draw(ctx, arrowData);
        break;
      case "curve":
        Curve.draw(ctx, arrowData);
        break;
      case "diamond":
        Diamond.draw(ctx, arrowData);
        break;
      case "inv_curve":
        InvertedCurve.draw(ctx, arrowData);
        break;
      case "triangle":
        Triangle.draw(ctx, arrowData);
        break;
      case "inv_triangle":
        InvertedTriangle.draw(ctx, arrowData);
        break;
      case "bar":
        Bar.draw(ctx, arrowData);
        break;
      case "vee":
        Vee.draw(ctx, arrowData);
        break;
      case "arrow": // fall-through
      default:
        Arrow.draw(ctx, arrowData);
    }
  }
}
