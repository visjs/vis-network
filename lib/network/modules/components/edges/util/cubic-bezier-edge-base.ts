import { BezierEdgeBase } from "./bezier-edge-base";
import { Label, EdgeOptions, Point, VBody } from "./types";

/**
 * A Base Class for all Cubic Bezier Edges. Bezier curves are used to model
 * smooth gradual curves in paths between nodes.
 *
 * @augments BezierEdgeBase
 */
export abstract class CubicBezierEdgeBase<Via> extends BezierEdgeBase<Via> {
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
   * Calculate the distance between a point (x3,y3) and a line segment from (x1,y1) to (x2,y2).
   *
   * @remarks
   * http://stackoverflow.com/questions/849211/shortest-distancae-between-a-point-and-a-line-segment
   * https://en.wikipedia.org/wiki/B%C3%A9zier_curve
   * @param x1 - First end of the line segment on the x axis.
   * @param y1 - First end of the line segment on the y axis.
   * @param x2 - Second end of the line segment on the x axis.
   * @param y2 - Second end of the line segment on the y axis.
   * @param x3 - Position of the point on the x axis.
   * @param y3 - Position of the point on the y axis.
   * @param via1 - The first point this edge passes through.
   * @param via2 - The second point this edge passes through.
   * @returns The distance between the line segment and the point.
   */
  protected _getDistanceToBezierEdge2(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    x3: number,
    y3: number,
    via1: Point,
    via2: Point
  ): number {
    // x3,y3 is the point
    let minDistance = 1e9;
    let lastX = x1;
    let lastY = y1;
    const vec = [0, 0, 0, 0];
    for (let i = 1; i < 10; i++) {
      const t = 0.1 * i;
      vec[0] = Math.pow(1 - t, 3);
      vec[1] = 3 * t * Math.pow(1 - t, 2);
      vec[2] = 3 * Math.pow(t, 2) * (1 - t);
      vec[3] = Math.pow(t, 3);
      const x = vec[0] * x1 + vec[1] * via1.x + vec[2] * via2.x + vec[3] * x2;
      const y = vec[0] * y1 + vec[1] * via1.y + vec[2] * via2.y + vec[3] * y2;
      if (i > 0) {
        const distance = this._getDistanceToLine(lastX, lastY, x, y, x3, y3);
        minDistance = distance < minDistance ? distance : minDistance;
      }
      lastX = x;
      lastY = y;
    }

    return minDistance;
  }
}
