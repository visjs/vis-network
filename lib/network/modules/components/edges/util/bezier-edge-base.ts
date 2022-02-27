import { EdgeBase } from "./edge-base";
import {
  EdgeFormattingValues,
  Label,
  EdgeOptions,
  Point,
  PointT,
  SelectiveRequired,
  VBody,
  VNode,
} from "./types";

/**
 * The Base Class for all Bezier edges.
 * Bezier curves are used to model smooth gradual curves in paths between nodes.
 */
export abstract class BezierEdgeBase<Via> extends EdgeBase<Via> {
  /**
   * Create a new instance.
   *
   * @param options - The options object of given edge.
   * @param body - The body of the network.
   * @param labelModule - Label module.
   */
  public constructor(options: EdgeOptions, body: VBody, labelModule: Label) {
    super(options, body, labelModule);
  }

  /**
   * Compute additional point(s) the edge passes through.
   *
   * @returns Cartesian coordinates of the point(s) the edge passes through.
   */
  protected abstract _getViaCoordinates(): Via;

  /**
   * Find the intersection between the border of the node and the edge.
   *
   * @remarks
   * This function uses binary search to look for the point where the bezier curve crosses the border of the node.
   * @param nearNode - The node (either from or to node of the edge).
   * @param ctx - The context that will be used for rendering.
   * @param viaNode - Additional node(s) the edge passes through.
   * @returns Cartesian coordinates of the intersection between the border of the node and the edge.
   */
  protected _findBorderPositionBezier(
    nearNode: VNode,
    ctx: CanvasRenderingContext2D,
    viaNode: Via = this._getViaCoordinates()
  ): PointT {
    const maxIterations = 10;
    const threshold = 0.2;
    let from = false;
    let high = 1;
    let low = 0;
    let node = this.to;
    let pos: Point;
    let middle: number;

    let endPointOffset = this.options.endPointOffset
      ? this.options.endPointOffset.to
      : 0;

    if (nearNode.id === this.from.id) {
      node = this.from;
      from = true;

      endPointOffset = this.options.endPointOffset
        ? this.options.endPointOffset.from
        : 0;
    }

    if (this.options.arrowStrikethrough === false) {
      endPointOffset = 0;
    }

    let iteration = 0;
    do {
      middle = (low + high) * 0.5;

      pos = this.getPoint(middle, viaNode);
      const angle = Math.atan2(node.y - pos.y, node.x - pos.x);

      const distanceToBorder =
        node.distanceToBorder(ctx, angle) + endPointOffset;

      const distanceToPoint = Math.sqrt(
        Math.pow(pos.x - node.x, 2) + Math.pow(pos.y - node.y, 2)
      );
      const difference = distanceToBorder - distanceToPoint;
      if (Math.abs(difference) < threshold) {
        break; // found
      } else if (difference < 0) {
        // distance to nodes is larger than distance to border --> t needs to be bigger if we're looking at the to node.
        if (from === false) {
          low = middle;
        } else {
          high = middle;
        }
      } else {
        if (from === false) {
          high = middle;
        } else {
          low = middle;
        }
      }

      ++iteration;
    } while (low <= high && iteration < maxIterations);

    return {
      ...pos,
      t: middle,
    };
  }

  /**
   * Calculate the distance between a point (x3,y3) and a line segment from (x1,y1) to (x2,y2).
   *
   * @remarks
   * http://stackoverflow.com/questions/849211/shortest-distancae-between-a-point-and-a-line-segment
   * @param x1 - First end of the line segment on the x axis.
   * @param y1 - First end of the line segment on the y axis.
   * @param x2 - Second end of the line segment on the x axis.
   * @param y2 - Second end of the line segment on the y axis.
   * @param x3 - Position of the point on the x axis.
   * @param y3 - Position of the point on the y axis.
   * @param via - The control point for the edge.
   * @returns The distance between the line segment and the point.
   */
  protected _getDistanceToBezierEdge(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    x3: number,
    y3: number,
    via: Point
  ): number {
    // x3,y3 is the point
    let minDistance = 1e9;
    let distance;
    let i, t, x, y;
    let lastX = x1;
    let lastY = y1;
    for (i = 1; i < 10; i++) {
      t = 0.1 * i;
      x =
        Math.pow(1 - t, 2) * x1 + 2 * t * (1 - t) * via.x + Math.pow(t, 2) * x2;
      y =
        Math.pow(1 - t, 2) * y1 + 2 * t * (1 - t) * via.y + Math.pow(t, 2) * y2;
      if (i > 0) {
        distance = this._getDistanceToLine(lastX, lastY, x, y, x3, y3);
        minDistance = distance < minDistance ? distance : minDistance;
      }
      lastX = x;
      lastY = y;
    }

    return minDistance;
  }

  /**
   * Render a bezier curve between two nodes.
   *
   * @remarks
   * The method accepts zero, one or two control points.
   * Passing zero control points just draws a straight line.
   * @param ctx - The context that will be used for rendering.
   * @param values - Style options for edge drawing.
   * @param viaNode1 - First control point for curve drawing.
   * @param viaNode2 - Second control point for curve drawing.
   */
  protected _bezierCurve(
    ctx: CanvasRenderingContext2D,
    values: SelectiveRequired<
      EdgeFormattingValues,
      | "backgroundColor"
      | "backgroundSize"
      | "shadowColor"
      | "shadowSize"
      | "shadowX"
      | "shadowY"
    >,
    viaNode1?: Point,
    viaNode2?: Point
  ): void {
    ctx.beginPath();
    ctx.moveTo(this.fromPoint.x, this.fromPoint.y);

    if (viaNode1 != null && viaNode1.x != null) {
      if (viaNode2 != null && viaNode2.x != null) {
        ctx.bezierCurveTo(
          viaNode1.x,
          viaNode1.y,
          viaNode2.x,
          viaNode2.y,
          this.toPoint.x,
          this.toPoint.y
        );
      } else {
        ctx.quadraticCurveTo(
          viaNode1.x,
          viaNode1.y,
          this.toPoint.x,
          this.toPoint.y
        );
      }
    } else {
      // fallback to normal straight edge
      ctx.lineTo(this.toPoint.x, this.toPoint.y);
    }

    // draw a background
    this.drawBackground(ctx, values);

    // draw shadow if enabled
    this.enableShadow(ctx, values);
    ctx.stroke();
    this.disableShadow(ctx, values);
  }

  /** @inheritDoc */
  public getViaNode(): Via {
    return this._getViaCoordinates();
  }
}
