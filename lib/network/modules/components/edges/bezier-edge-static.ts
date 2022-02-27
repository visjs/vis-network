import { BezierEdgeBase } from "./util/bezier-edge-base";
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
 * A Static Bezier Edge. Bezier curves are used to model smooth gradual curves in paths between nodes.
 */
export class BezierEdgeStatic extends BezierEdgeBase<Point> {
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
    viaNode: Point
  ): void {
    this._bezierCurve(ctx, values, viaNode);
  }

  /** @inheritDoc */
  public getViaNode(): Point {
    return this._getViaCoordinates();
  }

  /**
   * Compute the coordinates of the via node.
   *
   * @remarks
   * We do not use the to and fromPoints here to make the via nodes the same as edges without arrows.
   * @returns Cartesian coordinates of the via node.
   */
  protected _getViaCoordinates(): Point {
    // Assumption: x/y coordinates in from/to always defined
    const factor = this.options.smooth.roundness;
    const type = this.options.smooth.type;
    let dx = Math.abs(this.from.x - this.to.x);
    let dy = Math.abs(this.from.y - this.to.y);
    if (type === "discrete" || type === "diagonalCross") {
      let stepX;
      let stepY;

      if (dx <= dy) {
        stepX = stepY = factor * dy;
      } else {
        stepX = stepY = factor * dx;
      }

      if (this.from.x > this.to.x) {
        stepX = -stepX;
      }
      if (this.from.y >= this.to.y) {
        stepY = -stepY;
      }

      let xVia = this.from.x + stepX;
      let yVia = this.from.y + stepY;

      if (type === "discrete") {
        if (dx <= dy) {
          xVia = dx < factor * dy ? this.from.x : xVia;
        } else {
          yVia = dy < factor * dx ? this.from.y : yVia;
        }
      }

      return { x: xVia, y: yVia };
    } else if (type === "straightCross") {
      let stepX = (1 - factor) * dx;
      let stepY = (1 - factor) * dy;

      if (dx <= dy) {
        // up - down
        stepX = 0;
        if (this.from.y < this.to.y) {
          stepY = -stepY;
        }
      } else {
        // left - right
        if (this.from.x < this.to.x) {
          stepX = -stepX;
        }
        stepY = 0;
      }

      return {
        x: this.to.x + stepX,
        y: this.to.y + stepY,
      };
    } else if (type === "horizontal") {
      let stepX = (1 - factor) * dx;
      if (this.from.x < this.to.x) {
        stepX = -stepX;
      }

      return {
        x: this.to.x + stepX,
        y: this.from.y,
      };
    } else if (type === "vertical") {
      let stepY = (1 - factor) * dy;
      if (this.from.y < this.to.y) {
        stepY = -stepY;
      }

      return {
        x: this.from.x,
        y: this.to.y + stepY,
      };
    } else if (type === "curvedCW") {
      dx = this.to.x - this.from.x;
      dy = this.from.y - this.to.y;
      const radius = Math.sqrt(dx * dx + dy * dy);
      const pi = Math.PI;

      const originalAngle = Math.atan2(dy, dx);
      const myAngle = (originalAngle + (factor * 0.5 + 0.5) * pi) % (2 * pi);

      return {
        x: this.from.x + (factor * 0.5 + 0.5) * radius * Math.sin(myAngle),
        y: this.from.y + (factor * 0.5 + 0.5) * radius * Math.cos(myAngle),
      };
    } else if (type === "curvedCCW") {
      dx = this.to.x - this.from.x;
      dy = this.from.y - this.to.y;
      const radius = Math.sqrt(dx * dx + dy * dy);
      const pi = Math.PI;

      const originalAngle = Math.atan2(dy, dx);
      const myAngle = (originalAngle + (-factor * 0.5 + 0.5) * pi) % (2 * pi);

      return {
        x: this.from.x + (factor * 0.5 + 0.5) * radius * Math.sin(myAngle),
        y: this.from.y + (factor * 0.5 + 0.5) * radius * Math.cos(myAngle),
      };
    } else {
      // continuous
      let stepX;
      let stepY;

      if (dx <= dy) {
        stepX = stepY = factor * dy;
      } else {
        stepX = stepY = factor * dx;
      }

      if (this.from.x > this.to.x) {
        stepX = -stepX;
      }
      if (this.from.y >= this.to.y) {
        stepY = -stepY;
      }

      let xVia = this.from.x + stepX;
      let yVia = this.from.y + stepY;

      if (dx <= dy) {
        if (this.from.x <= this.to.x) {
          xVia = this.to.x < xVia ? this.to.x : xVia;
        } else {
          xVia = this.to.x > xVia ? this.to.x : xVia;
        }
      } else {
        if (this.from.y >= this.to.y) {
          yVia = this.to.y > yVia ? this.to.y : yVia;
        } else {
          yVia = this.to.y < yVia ? this.to.y : yVia;
        }
      }

      return { x: xVia, y: yVia };
    }
  }

  /** @inheritDoc */
  protected _findBorderPosition(
    nearNode: VNode,
    ctx: CanvasRenderingContext2D,
    options: { via?: Point } = {}
  ): PointT {
    return this._findBorderPositionBezier(nearNode, ctx, options.via);
  }

  /** @inheritDoc */
  protected _getDistanceToEdge(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    x3: number,
    y3: number,
    viaNode = this._getViaCoordinates()
  ) {
    // x3,y3 is the point
    return this._getDistanceToBezierEdge(x1, y1, x2, y2, x3, y3, viaNode);
  }

  /** @inheritDoc */
  public getPoint(
    position: number,
    viaNode: Point = this._getViaCoordinates()
  ): Point {
    const t = position;
    const x =
      Math.pow(1 - t, 2) * this.fromPoint.x +
      2 * t * (1 - t) * viaNode.x +
      Math.pow(t, 2) * this.toPoint.x;
    const y =
      Math.pow(1 - t, 2) * this.fromPoint.y +
      2 * t * (1 - t) * viaNode.y +
      Math.pow(t, 2) * this.toPoint.y;

    return { x: x, y: y };
  }
}
