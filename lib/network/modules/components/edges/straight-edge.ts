import { EdgeBase } from "./util/edge-base";
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
 * A Straight Edge.
 */
export class StraightEdge extends EdgeBase {
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
      "shadowColor" | "shadowSize" | "shadowX" | "shadowY"
    >
  ): void {
    // draw a straight line
    ctx.beginPath();
    ctx.moveTo(this.fromPoint.x, this.fromPoint.y);
    ctx.lineTo(this.toPoint.x, this.toPoint.y);
    // draw shadow if enabled
    this.enableShadow(ctx, values);
    ctx.stroke();
    this.disableShadow(ctx, values);
  }

  /** @inheritDoc */
  public getViaNode(): undefined {
    return undefined;
  }

  /** @inheritDoc */
  public getPoint(position: number): Point {
    return {
      x: (1 - position) * this.fromPoint.x + position * this.toPoint.x,
      y: (1 - position) * this.fromPoint.y + position * this.toPoint.y,
    };
  }

  /** @inheritDoc */
  protected _findBorderPosition(
    nearNode: VNode,
    ctx: CanvasRenderingContext2D
  ): PointT {
    let node1 = this.to;
    let node2 = this.from;
    if (nearNode.id === this.from.id) {
      node1 = this.from;
      node2 = this.to;
    }

    const angle = Math.atan2(node1.y - node2.y, node1.x - node2.x);
    const dx = node1.x - node2.x;
    const dy = node1.y - node2.y;
    const edgeSegmentLength = Math.sqrt(dx * dx + dy * dy);
    const toBorderDist = nearNode.distanceToBorder(ctx, angle);
    const toBorderPoint =
      (edgeSegmentLength - toBorderDist) / edgeSegmentLength;

    return {
      x: (1 - toBorderPoint) * node2.x + toBorderPoint * node1.x,
      y: (1 - toBorderPoint) * node2.y + toBorderPoint * node1.y,
      t: 0,
    };
  }

  /** @inheritDoc */
  protected _getDistanceToEdge(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    x3: number,
    y3: number
  ): number {
    // x3,y3 is the point
    return this._getDistanceToLine(x1, y1, x2, y2, x3, y3);
  }
}
