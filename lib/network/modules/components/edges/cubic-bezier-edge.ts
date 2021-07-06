import { CubicBezierEdgeBase } from "./util/cubic-bezier-edge-base";
import {
  EdgeFormattingValues,
  Label,
  EdgeOptions,
  Point,
  PointT,
  SelectiveRequired,
  VBody,
  VNode,
} from "./util/types";

/**
 * A Cubic Bezier Edge. Bezier curves are used to model smooth gradual curves in paths between nodes.
 */
export class CubicBezierEdge extends CubicBezierEdgeBase<[Point, Point]> {
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

  /** @inheritDoc */
  protected _line(
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
    viaNodes: [Point, Point]
  ): void {
    // get the coordinates of the support points.
    const via1 = viaNodes[0];
    const via2 = viaNodes[1];
    this._bezierCurve(ctx, values, via1, via2);
  }

  /**
   * Compute the additional points the edge passes through.
   *
   * @returns Cartesian coordinates of the points the edge passes through.
   */
  protected _getViaCoordinates(): [Point, Point] {
    const dx = this.from.x - this.to.x;
    const dy = this.from.y - this.to.y;

    let x1: number;
    let y1: number;
    let x2: number;
    let y2: number;
    const roundness = this.options.smooth.roundness;

    // horizontal if x > y or if direction is forced or if direction is horizontal
    if (
      (Math.abs(dx) > Math.abs(dy) ||
        this.options.smooth.forceDirection === true ||
        this.options.smooth.forceDirection === "horizontal") &&
      this.options.smooth.forceDirection !== "vertical"
    ) {
      y1 = this.from.y;
      y2 = this.to.y;
      x1 = this.from.x - roundness * dx;
      x2 = this.to.x + roundness * dx;
    } else {
      y1 = this.from.y - roundness * dy;
      y2 = this.to.y + roundness * dy;
      x1 = this.from.x;
      x2 = this.to.x;
    }

    return [
      { x: x1, y: y1 },
      { x: x2, y: y2 },
    ];
  }

  /** @inheritDoc */
  public getViaNode(): [Point, Point] {
    return this._getViaCoordinates();
  }

  /** @inheritDoc */
  protected _findBorderPosition(
    nearNode: VNode,
    ctx: CanvasRenderingContext2D
  ): PointT {
    return this._findBorderPositionBezier(nearNode, ctx);
  }

  /** @inheritDoc */
  protected _getDistanceToEdge(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    x3: number,
    y3: number,
    [via1, via2]: [Point, Point] = this._getViaCoordinates()
  ): number {
    // x3,y3 is the point
    return this._getDistanceToBezierEdge2(x1, y1, x2, y2, x3, y3, via1, via2);
  }

  /** @inheritDoc */
  public getPoint(
    position: number,
    [via1, via2]: [Point, Point] = this._getViaCoordinates()
  ): Point {
    const t = position;
    const vec: [number, number, number, number] = [
      Math.pow(1 - t, 3),
      3 * t * Math.pow(1 - t, 2),
      3 * Math.pow(t, 2) * (1 - t),
      Math.pow(t, 3),
    ];
    const x =
      vec[0] * this.fromPoint.x +
      vec[1] * via1.x +
      vec[2] * via2.x +
      vec[3] * this.toPoint.x;
    const y =
      vec[0] * this.fromPoint.y +
      vec[1] * via1.y +
      vec[2] * via2.y +
      vec[3] * this.toPoint.y;

    return { x: x, y: y };
  }
}
