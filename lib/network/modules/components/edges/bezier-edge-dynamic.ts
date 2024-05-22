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
 * A Dynamic Bezier Edge. Bezier curves are used to model smooth gradual
 * curves in paths between nodes. The Dynamic piece refers to how the curve
 * reacts to physics changes.
 *
 * @augments BezierEdgeBase
 */
export class BezierEdgeDynamic extends BezierEdgeBase<Point> {
  public via: VNode = this.via; // constructor → super → super → setOptions → setupSupportNode
  private readonly _boundFunction: () => void;

  /**
   * Create a new instance.
   *
   * @param options - The options object of given edge.
   * @param body - The body of the network.
   * @param labelModule - Label module.
   */
  public constructor(options: EdgeOptions, body: VBody, labelModule: Label) {
    //this.via = undefined; // Here for completeness but not allowed to defined before super() is invoked.
    super(options, body, labelModule); // --> this calls the setOptions below
    this._boundFunction = (): void => {
      this.positionBezierNode();
    };
    this._body.emitter.on("_repositionBezierNodes", this._boundFunction);
  }

  /** @inheritDoc */
  public setOptions(options: EdgeOptions): void {
    super.setOptions(options);

    // check if the physics has changed.
    let physicsChange = false;
    if (this.options.physics !== options.physics) {
      physicsChange = true;
    }

    // set the options and the to and from nodes
    this.options = options;
    this.id = this.options.id;
    this.from = this._body.nodes[this.options.from];
    this.to = this._body.nodes[this.options.to];

    // setup the support node and connect
    this.setupSupportNode();
    this.connect();

    // when we change the physics state of the edge, we reposition the support node.
    if (physicsChange === true) {
      this.via.setOptions({ physics: this.options.physics });
      this.positionBezierNode();
    }
  }

  /** @inheritDoc */
  public connect(): void {
    this.from = this._body.nodes[this.options.from];
    this.to = this._body.nodes[this.options.to];
    if (
      this.from === undefined ||
      this.to === undefined ||
      this.options.physics === false
    ) {
      this.via.setOptions({ physics: false });
    } else {
      // fix weird behaviour where a self referencing node has physics enabled
      if (this.from.id === this.to.id) {
        this.via.setOptions({ physics: false });
      } else {
        this.via.setOptions({ physics: true });
      }
    }
  }

  /** @inheritDoc */
  public cleanup(): boolean {
    this._body.emitter.off("_repositionBezierNodes", this._boundFunction);
    if (this.via !== undefined) {
      delete this._body.nodes[this.via.id];
      this.via = undefined;
      return true;
    }
    return false;
  }

  /**
   * Create and add a support node if not already present.
   *
   * @remarks
   * Bezier curves require an anchor point to calculate the smooth flow.
   * These points are nodes.
   * These nodes are invisible but are used for the force calculation.
   *
   * The changed data is not called, if needed, it is returned by the main edge constructor.
   */
  public setupSupportNode(): void {
    if (this.via === undefined) {
      const nodeId = "edgeId:" + this.id;
      const node = this._body.functions.createNode({
        id: nodeId,
        shape: "circle",
        physics: true,
        hidden: true,
      });
      this._body.nodes[nodeId] = node;
      this.via = node;
      this.via.parentEdgeId = this.id;
      this.positionBezierNode();
    }
  }

  /**
   * Position bezier node.
   */
  public positionBezierNode(): void {
    if (
      this.via !== undefined &&
      this.from !== undefined &&
      this.to !== undefined
    ) {
      this.via.x = 0.5 * (this.from.x + this.to.x);
      this.via.y = 0.5 * (this.from.y + this.to.y);
    } else if (this.via !== undefined) {
      this.via.x = 0;
      this.via.y = 0;
    }
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
    viaNode: VNode
  ): void {
    this._bezierCurve(ctx, values, viaNode);
  }

  /** @inheritDoc */
  protected _getViaCoordinates(): Point {
    return this.via;
  }

  /** @inheritDoc */
  public getViaNode(): Point {
    return this.via;
  }

  /** @inheritDoc */
  public getPoint(position: number, viaNode: Point = this.via): Point {
    if (this.from === this.to) {
      const [cx, cy, cr] = this._getCircleData();
      const a = 2 * Math.PI * (1 - position);
      return {
        x: cx + cr * Math.sin(a),
        y: cy + cr - cr * (1 - Math.cos(a)),
      };
    } else {
      return {
        x:
          Math.pow(1 - position, 2) * this.fromPoint.x +
          2 * position * (1 - position) * viaNode.x +
          Math.pow(position, 2) * this.toPoint.x,
        y:
          Math.pow(1 - position, 2) * this.fromPoint.y +
          2 * position * (1 - position) * viaNode.y +
          Math.pow(position, 2) * this.toPoint.y,
      };
    }
  }

  /** @inheritDoc */
  protected _findBorderPosition(
    nearNode: VNode,
    ctx: CanvasRenderingContext2D
  ): PointT {
    return this._findBorderPositionBezier(nearNode, ctx, this.via);
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
    return this._getDistanceToBezierEdge(x1, y1, x2, y2, x3, y3, this.via);
  }
}
