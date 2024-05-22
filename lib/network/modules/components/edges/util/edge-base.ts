import { overrideOpacity } from "vis-util/esnext";
import { EndPoints } from "./end-points";
import {
  ArrowData,
  ArrowDataWithCore,
  ArrowType,
  EdgeFormattingValues,
  EdgeType,
  Id,
  Label,
  EdgeOptions,
  Point,
  PointT,
  SelectiveRequired,
  VBody,
  VNode,
} from "./types";
import { drawDashedLine } from "./shapes";
import { getSelfRefCoordinates } from "../../shared/ComponentUtil";

export interface FindBorderPositionOptions<Via> {
  via: Via;
}
export interface FindBorderPositionCircleOptions {
  x: number;
  y: number;
  low: number;
  high: number;
  direction: number;
}

/**
 * The Base Class for all edges.
 */
export abstract class EdgeBase<Via = undefined> implements EdgeType {
  public from!: VNode; // Initialized in setOptions
  public fromPoint: Point;
  public to!: VNode; // Initialized in setOptions
  public toPoint: Point;
  public via?: VNode;

  public color: unknown = {};
  public colorDirty = true;
  public id!: Id; // Initialized in setOptions
  public options!: EdgeOptions; // Initialized in setOptions
  public hoverWidth = 1.5;
  public selectionWidth = 2;

  /**
   * Create a new instance.
   *
   * @param options - The options object of given edge.
   * @param _body - The body of the network.
   * @param _labelModule - Label module.
   */
  public constructor(
    options: EdgeOptions,
    protected _body: VBody,
    protected _labelModule: Label
  ) {
    this.setOptions(options);

    this.fromPoint = this.from;
    this.toPoint = this.to;
  }

  /**
   * Find the intersection between the border of the node and the edge.
   *
   * @param node - The node (either from or to node of the edge).
   * @param ctx - The context that will be used for rendering.
   * @param options - Additional options.
   * @returns Cartesian coordinates of the intersection between the border of the node and the edge.
   */
  protected abstract _findBorderPosition(
    node: VNode,
    ctx: CanvasRenderingContext2D,
    options?: FindBorderPositionOptions<Via>
  ): PointT;

  /**
   * Return additional point(s) the edge passes through.
   *
   * @returns Cartesian coordinates of the point(s) the edge passes through.
   */
  public abstract getViaNode(): Via;

  /** @inheritDoc */
  public abstract getPoint(position: number, viaNode?: Via): Point;

  /** @inheritDoc */
  public connect(): void {
    this.from = this._body.nodes[this.options.from];
    this.to = this._body.nodes[this.options.to];
  }

  /** @inheritDoc */
  public cleanup(): boolean {
    return false;
  }

  /**
   * Set new edge options.
   *
   * @param options - The new edge options object.
   */
  public setOptions(options: EdgeOptions): void {
    this.options = options;

    this.from = this._body.nodes[this.options.from];
    this.to = this._body.nodes[this.options.to];
    this.id = this.options.id;
  }

  /** @inheritDoc */
  public drawLine(
    ctx: CanvasRenderingContext2D,
    values: SelectiveRequired<
      EdgeFormattingValues,
      | "color"
      | "opacity"
      | "shadowColor"
      | "shadowSize"
      | "shadowX"
      | "shadowY"
      | "width"
    >,
    _selected?: boolean,
    _hover?: boolean,
    viaNode: Via = this.getViaNode()
  ): void {
    // set style
    ctx.strokeStyle = this.getColor(ctx, values);
    ctx.lineWidth = values.width;

    if (values.dashes !== false) {
      this._drawDashedLine(ctx, values, viaNode);
    } else {
      this._drawLine(ctx, values, viaNode);
    }
  }

  /**
   * Draw a line with given style between two nodes through supplied node(s).
   *
   * @param ctx - The context that will be used for rendering.
   * @param values - Formatting values like color, opacity or shadow.
   * @param viaNode - Additional control point(s) for the edge.
   * @param fromPoint - TODO: Seems ignored, remove?
   * @param toPoint - TODO: Seems ignored, remove?
   */
  private _drawLine(
    ctx: CanvasRenderingContext2D,
    values: SelectiveRequired<
      EdgeFormattingValues,
      "shadowColor" | "shadowSize" | "shadowX" | "shadowY"
    >,
    viaNode: Via,
    fromPoint?: Point,
    toPoint?: Point
  ): void {
    if (this.from != this.to) {
      // draw line
      this._line(ctx, values, viaNode, fromPoint, toPoint);
    } else {
      const [x, y, radius] = this._getCircleData(ctx);
      this._circle(ctx, values, x, y, radius);
    }
  }

  /**
   * Draw a dashed line with given style between two nodes through supplied node(s).
   *
   * @param ctx - The context that will be used for rendering.
   * @param values - Formatting values like color, opacity or shadow.
   * @param viaNode - Additional control point(s) for the edge.
   * @param _fromPoint - Ignored (TODO: remove in the future).
   * @param _toPoint - Ignored (TODO: remove in the future).
   */
  private _drawDashedLine(
    ctx: CanvasRenderingContext2D,
    values: SelectiveRequired<
      EdgeFormattingValues,
      "shadowColor" | "shadowSize" | "shadowX" | "shadowY"
    >,
    viaNode: Via,
    _fromPoint?: Point,
    _toPoint?: Point
  ): void {
    ctx.lineCap = "round";
    const pattern = Array.isArray(values.dashes) ? values.dashes : [5, 5];

    // only firefox and chrome support this method, else we use the legacy one.
    if (ctx.setLineDash !== undefined) {
      ctx.save();

      // set dash settings for chrome or firefox
      ctx.setLineDash(pattern);
      ctx.lineDashOffset = 0;

      // draw the line
      if (this.from != this.to) {
        // draw line
        this._line(ctx, values, viaNode);
      } else {
        const [x, y, radius] = this._getCircleData(ctx);
        this._circle(ctx, values, x, y, radius);
      }

      // restore the dash settings.
      ctx.setLineDash([0]);
      ctx.lineDashOffset = 0;
      ctx.restore();
    } else {
      // unsupporting smooth lines
      if (this.from != this.to) {
        // draw line
        drawDashedLine(
          ctx,
          this.from.x,
          this.from.y,
          this.to.x,
          this.to.y,
          pattern
        );
      } else {
        const [x, y, radius] = this._getCircleData(ctx);
        this._circle(ctx, values, x, y, radius);
      }
      // draw shadow if enabled
      this.enableShadow(ctx, values);

      ctx.stroke();

      // disable shadows for other elements.
      this.disableShadow(ctx, values);
    }
  }

  /**
   * Draw a line with given style between two nodes through supplied node(s).
   *
   * @param ctx - The context that will be used for rendering.
   * @param values - Formatting values like color, opacity or shadow.
   * @param viaNode - Additional control point(s) for the edge.
   * @param fromPoint - TODO: Seems ignored, remove?
   * @param toPoint - TODO: Seems ignored, remove?
   */
  protected abstract _line(
    ctx: CanvasRenderingContext2D,
    values: EdgeFormattingValues,
    viaNode: Via,
    fromPoint?: Point,
    toPoint?: Point
  ): void;

  /**
   * Find the intersection between the border of the node and the edge.
   *
   * @param node - The node (either from or to node of the edge).
   * @param ctx - The context that will be used for rendering.
   * @param options - Additional options.
   * @returns Cartesian coordinates of the intersection between the border of the node and the edge.
   */
  public findBorderPosition(
    node: VNode,
    ctx: CanvasRenderingContext2D,
    options?: FindBorderPositionOptions<Via> | FindBorderPositionCircleOptions
  ): PointT {
    if (this.from != this.to) {
      return this._findBorderPosition(node, ctx, options as any);
    } else {
      return this._findBorderPositionCircle(node, ctx, options as any);
    }
  }

  /** @inheritDoc */
  public findBorderPositions(ctx: CanvasRenderingContext2D): {
    from: Point;
    to: Point;
  } {
    if (this.from != this.to) {
      return {
        from: this._findBorderPosition(this.from, ctx),
        to: this._findBorderPosition(this.to, ctx),
      };
    } else {
      const [x, y] = this._getCircleData(ctx).slice(0, 2);

      return {
        from: this._findBorderPositionCircle(this.from, ctx, {
          x,
          y,
          low: 0.25,
          high: 0.6,
          direction: -1,
        }),
        to: this._findBorderPositionCircle(this.from, ctx, {
          x,
          y,
          low: 0.6,
          high: 0.8,
          direction: 1,
        }),
      };
    }
  }

  /**
   * Compute the center point and radius of an edge connected to the same node at both ends.
   *
   * @param ctx - The context that will be used for rendering.
   * @returns `[x, y, radius]`
   */
  protected _getCircleData(
    ctx?: CanvasRenderingContext2D
  ): [number, number, number] {
    const radius = this.options.selfReference.size;

    if (ctx !== undefined) {
      if (this.from.shape.width === undefined) {
        this.from.shape.resize(ctx);
      }
    }

    // get circle coordinates
    const coordinates = getSelfRefCoordinates(
      ctx,
      this.options.selfReference.angle,
      radius,
      this.from
    );

    return [coordinates.x, coordinates.y, radius];
  }

  /**
   * Get a point on a circle.
   *
   * @param x - Center of the circle on the x axis.
   * @param y - Center of the circle on the y axis.
   * @param radius - Radius of the circle.
   * @param position - Value between 0 (line start) and 1 (line end).
   * @returns Cartesian coordinates of requested point on the circle.
   */
  private _pointOnCircle(
    x: number,
    y: number,
    radius: number,
    position: number
  ): Point {
    const angle = position * 2 * Math.PI;
    return {
      x: x + radius * Math.cos(angle),
      y: y - radius * Math.sin(angle),
    };
  }

  /**
   * Find the intersection between the border of the node and the edge.
   *
   * @remarks
   * This function uses binary search to look for the point where the circle crosses the border of the node.
   * @param nearNode - The node (either from or to node of the edge).
   * @param ctx - The context that will be used for rendering.
   * @param options - Additional options.
   * @returns Cartesian coordinates of the intersection between the border of the node and the edge.
   */
  private _findBorderPositionCircle(
    nearNode: VNode,
    ctx: CanvasRenderingContext2D,
    options: FindBorderPositionCircleOptions
  ): PointT {
    const x = options.x;
    const y = options.y;
    let low = options.low;
    let high = options.high;
    const direction = options.direction;

    const maxIterations = 10;
    const radius = this.options.selfReference.size;
    const threshold = 0.05;
    let pos: Point;

    let middle = (low + high) * 0.5;

    let endPointOffset = 0;
    if (this.options.arrowStrikethrough === true) {
      if (direction === -1) {
        endPointOffset = this.options.endPointOffset.from;
      } else if (direction === 1) {
        endPointOffset = this.options.endPointOffset.to;
      }
    }

    let iteration = 0;
    do {
      middle = (low + high) * 0.5;

      pos = this._pointOnCircle(x, y, radius, middle);
      const angle = Math.atan2(nearNode.y - pos.y, nearNode.x - pos.x);

      const distanceToBorder =
        nearNode.distanceToBorder(ctx, angle) + endPointOffset;

      const distanceToPoint = Math.sqrt(
        Math.pow(pos.x - nearNode.x, 2) + Math.pow(pos.y - nearNode.y, 2)
      );
      const difference = distanceToBorder - distanceToPoint;
      if (Math.abs(difference) < threshold) {
        break; // found
      } else if (difference > 0) {
        // distance to nodes is larger than distance to border --> t needs to be bigger if we're looking at the to node.
        if (direction > 0) {
          low = middle;
        } else {
          high = middle;
        }
      } else {
        if (direction > 0) {
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
   * Get the line width of the edge. Depends on width and whether one of the connected nodes is selected.
   *
   * @param selected - Determines wheter the line is selected.
   * @param hover - Determines wheter the line is being hovered, only applies if selected is false.
   * @returns The width of the line.
   */
  public getLineWidth(selected: boolean, hover: boolean): number {
    if (selected === true) {
      return Math.max(this.selectionWidth, 0.3 / this._body.view.scale);
    } else if (hover === true) {
      return Math.max(this.hoverWidth, 0.3 / this._body.view.scale);
    } else {
      return Math.max(this.options.width, 0.3 / this._body.view.scale);
    }
  }

  /**
   * Compute the color or gradient for given edge.
   *
   * @param ctx - The context that will be used for rendering.
   * @param values - Formatting values like color, opacity or shadow.
   * @param _selected - Ignored (TODO: remove in the future).
   * @param _hover - Ignored (TODO: remove in the future).
   * @returns Color string if single color is inherited or gradient if two.
   */
  public getColor(
    ctx: CanvasRenderingContext2D,
    values: SelectiveRequired<EdgeFormattingValues, "color" | "opacity">
  ): string | CanvasGradient {
    if (values.inheritsColor !== false) {
      // when this is a loop edge, just use the 'from' method
      if (values.inheritsColor === "both" && this.from.id !== this.to.id) {
        const grd = ctx.createLinearGradient(
          this.from.x,
          this.from.y,
          this.to.x,
          this.to.y
        );
        let fromColor = this.from.options.color.highlight.border;
        let toColor = this.to.options.color.highlight.border;

        if (this.from.selected === false && this.to.selected === false) {
          fromColor = overrideOpacity(
            this.from.options.color.border,
            values.opacity
          );
          toColor = overrideOpacity(
            this.to.options.color.border,
            values.opacity
          );
        } else if (this.from.selected === true && this.to.selected === false) {
          toColor = this.to.options.color.border;
        } else if (this.from.selected === false && this.to.selected === true) {
          fromColor = this.from.options.color.border;
        }
        grd.addColorStop(0, fromColor);
        grd.addColorStop(1, toColor);

        // -------------------- this returns -------------------- //
        return grd;
      }

      if (values.inheritsColor === "to") {
        return overrideOpacity(this.to.options.color.border, values.opacity);
      } else {
        // "from"
        return overrideOpacity(this.from.options.color.border, values.opacity);
      }
    } else {
      return overrideOpacity(values.color, values.opacity);
    }
  }

  /**
   * Draw a line from a node to itself, a circle.
   *
   * @param ctx - The context that will be used for rendering.
   * @param values - Formatting values like color, opacity or shadow.
   * @param x - Center of the circle on the x axis.
   * @param y - Center of the circle on the y axis.
   * @param radius - Radius of the circle.
   */
  private _circle(
    ctx: CanvasRenderingContext2D,
    values: SelectiveRequired<
      EdgeFormattingValues,
      "shadowColor" | "shadowSize" | "shadowX" | "shadowY"
    >,
    x: number,
    y: number,
    radius: number
  ): void {
    // draw shadow if enabled
    this.enableShadow(ctx, values);

    //full circle
    let angleFrom = 0;
    let angleTo = Math.PI * 2;

    if (!this.options.selfReference.renderBehindTheNode) {
      //render only parts which are not overlaping with parent node
      //need to find x,y of from point and x,y to point
      //calculating radians
      const low = this.options.selfReference.angle;
      const high = this.options.selfReference.angle + Math.PI;
      const pointTFrom = this._findBorderPositionCircle(this.from, ctx, {
        x,
        y,
        low,
        high,
        direction: -1,
      });
      const pointTTo = this._findBorderPositionCircle(this.from, ctx, {
        x,
        y,
        low,
        high,
        direction: 1,
      });
      angleFrom = Math.atan2(pointTFrom.y - y, pointTFrom.x - x);
      angleTo = Math.atan2(pointTTo.y - y, pointTTo.x - x);
    }

    // draw a circle
    ctx.beginPath();
    ctx.arc(x, y, radius, angleFrom, angleTo, false);
    ctx.stroke();

    // disable shadows for other elements.
    this.disableShadow(ctx, values);
  }

  /**
   * @inheritDoc
   * @remarks
   * http://stackoverflow.com/questions/849211/shortest-distancae-between-a-point-and-a-line-segment
   */
  public getDistanceToEdge(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    x3: number,
    y3: number
  ): number {
    if (this.from != this.to) {
      return this._getDistanceToEdge(x1, y1, x2, y2, x3, y3);
    } else {
      const [x, y, radius] = this._getCircleData(undefined);
      const dx = x - x3;
      const dy = y - y3;
      return Math.abs(Math.sqrt(dx * dx + dy * dy) - radius);
    }
  }

  /**
   * Calculate the distance between a point (x3, y3) and a line segment from (x1, y1) to (x2, y2).
   *
   * @remarks
   * http://stackoverflow.com/questions/849211/shortest-distancae-between-a-point-and-a-line-segment
   * @param x1 - First end of the line segment on the x axis.
   * @param y1 - First end of the line segment on the y axis.
   * @param x2 - Second end of the line segment on the x axis.
   * @param y2 - Second end of the line segment on the y axis.
   * @param x3 - Position of the point on the x axis.
   * @param y3 - Position of the point on the y axis.
   * @param via - Additional control point(s) for the edge.
   * @returns The distance between the line segment and the point.
   */
  protected abstract _getDistanceToEdge(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    x3: number,
    y3: number,
    via?: Via
  ): number;

  /**
   * Calculate the distance between a point (x3, y3) and a line segment from (x1, y1) to (x2, y2).
   *
   * @param x1 - First end of the line segment on the x axis.
   * @param y1 - First end of the line segment on the y axis.
   * @param x2 - Second end of the line segment on the x axis.
   * @param y2 - Second end of the line segment on the y axis.
   * @param x3 - Position of the point on the x axis.
   * @param y3 - Position of the point on the y axis.
   * @returns The distance between the line segment and the point.
   */
  protected _getDistanceToLine(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    x3: number,
    y3: number
  ): number {
    const px = x2 - x1;
    const py = y2 - y1;
    const something = px * px + py * py;
    let u = ((x3 - x1) * px + (y3 - y1) * py) / something;

    if (u > 1) {
      u = 1;
    } else if (u < 0) {
      u = 0;
    }

    const x = x1 + u * px;
    const y = y1 + u * py;
    const dx = x - x3;
    const dy = y - y3;

    //# Note: If the actual distance does not matter,
    //# if you only want to compare what this function
    //# returns to other results of this function, you
    //# can just return the squared distance instead
    //# (i.e. remove the sqrt) to gain a little performance

    return Math.sqrt(dx * dx + dy * dy);
  }

  /** @inheritDoc */
  public getArrowData(
    ctx: CanvasRenderingContext2D,
    position: "middle",
    viaNode: VNode,
    selected: boolean,
    hover: boolean,
    values: SelectiveRequired<
      EdgeFormattingValues,
      "middleArrowType" | "middleArrowScale" | "width"
    >
  ): ArrowDataWithCore;
  /** @inheritDoc */
  public getArrowData(
    ctx: CanvasRenderingContext2D,
    position: "to",
    viaNode: VNode,
    selected: boolean,
    hover: boolean,
    values: SelectiveRequired<
      EdgeFormattingValues,
      "toArrowType" | "toArrowScale" | "width"
    >
  ): ArrowDataWithCore;
  /** @inheritDoc */
  public getArrowData(
    ctx: CanvasRenderingContext2D,
    position: "from",
    viaNode: VNode,
    selected: boolean,
    hover: boolean,
    values: SelectiveRequired<
      EdgeFormattingValues,
      "fromArrowType" | "fromArrowScale" | "width"
    >
  ): ArrowDataWithCore;
  /** @inheritDoc */
  public getArrowData(
    ctx: CanvasRenderingContext2D,
    position: "from" | "to" | "middle",
    viaNode: VNode,
    _selected: boolean,
    _hover: boolean,
    values: SelectiveRequired<EdgeFormattingValues, "width">
  ): ArrowDataWithCore {
    // set lets
    let angle: number;
    let arrowPoint: Point;
    let node1: VNode;
    let node2: VNode;
    let reversed: boolean;
    let scaleFactor: number;
    let type: ArrowType;
    const lineWidth: number = values.width;

    if (position === "from") {
      node1 = this.from;
      node2 = this.to;
      reversed = values.fromArrowScale! < 0;
      scaleFactor = Math.abs(values.fromArrowScale!);
      type = values.fromArrowType!;
    } else if (position === "to") {
      node1 = this.to;
      node2 = this.from;
      reversed = values.toArrowScale! < 0;
      scaleFactor = Math.abs(values.toArrowScale!);
      type = values.toArrowType!;
    } else {
      node1 = this.to;
      node2 = this.from;
      reversed = values.middleArrowScale! < 0;
      scaleFactor = Math.abs(values.middleArrowScale!);
      type = values.middleArrowType!;
    }

    const length = 15 * scaleFactor + 3 * lineWidth; // 3* lineWidth is the width of the edge.

    // if not connected to itself
    if (node1 != node2) {
      const approximateEdgeLength = Math.hypot(
        node1.x - node2.x,
        node1.y - node2.y
      );
      const relativeLength = length / approximateEdgeLength;

      if (position !== "middle") {
        // draw arrow head
        if (this.options.smooth.enabled === true) {
          const pointT = this._findBorderPosition(node1, ctx, { via: viaNode });
          const guidePos = this.getPoint(
            pointT.t + relativeLength * (position === "from" ? 1 : -1),
            viaNode
          );
          angle = Math.atan2(pointT.y - guidePos.y, pointT.x - guidePos.x);
          arrowPoint = pointT;
        } else {
          angle = Math.atan2(node1.y - node2.y, node1.x - node2.x);
          arrowPoint = this._findBorderPosition(node1, ctx);
        }
      } else {
        // Negative half length reverses arrow direction.
        const halfLength = (reversed ? -relativeLength : relativeLength) / 2;
        const guidePos1 = this.getPoint(0.5 + halfLength, viaNode);
        const guidePos2 = this.getPoint(0.5 - halfLength, viaNode);
        angle = Math.atan2(
          guidePos1.y - guidePos2.y,
          guidePos1.x - guidePos2.x
        );
        arrowPoint = this.getPoint(0.5, viaNode);
      }
    } else {
      // draw circle
      const [x, y, radius] = this._getCircleData(ctx);

      if (position === "from") {
        const low = this.options.selfReference.angle;
        const high = this.options.selfReference.angle + Math.PI;

        const pointT = this._findBorderPositionCircle(this.from, ctx, {
          x,
          y,
          low,
          high,
          direction: -1,
        });
        angle = pointT.t * -2 * Math.PI + 1.5 * Math.PI + 0.1 * Math.PI;
        arrowPoint = pointT;
      } else if (position === "to") {
        const low = this.options.selfReference.angle;
        const high = this.options.selfReference.angle + Math.PI;

        const pointT = this._findBorderPositionCircle(this.from, ctx, {
          x,
          y,
          low,
          high,
          direction: 1,
        });
        angle = pointT.t * -2 * Math.PI + 1.5 * Math.PI - 1.1 * Math.PI;
        arrowPoint = pointT;
      } else {
        const pos = this.options.selfReference.angle / (2 * Math.PI);
        arrowPoint = this._pointOnCircle(x, y, radius, pos);
        angle = pos * -2 * Math.PI + 1.5 * Math.PI + 0.1 * Math.PI;
      }
    }

    const xi = arrowPoint.x - length * 0.9 * Math.cos(angle);
    const yi = arrowPoint.y - length * 0.9 * Math.sin(angle);
    const arrowCore = { x: xi, y: yi };

    return {
      point: arrowPoint,
      core: arrowCore,
      angle: angle,
      length: length,
      type: type,
    };
  }

  /** @inheritDoc */
  public drawArrowHead(
    ctx: CanvasRenderingContext2D,
    values: SelectiveRequired<
      EdgeFormattingValues,
      | "color"
      | "opacity"
      | "shadowColor"
      | "shadowSize"
      | "shadowX"
      | "shadowY"
      | "width"
    >,
    _selected: boolean,
    _hover: boolean,
    arrowData: ArrowData
  ): void {
    // set style
    ctx.strokeStyle = this.getColor(ctx, values);
    ctx.fillStyle = ctx.strokeStyle;
    ctx.lineWidth = values.width;

    const canFill = EndPoints.draw(ctx, arrowData);

    if (canFill) {
      // draw shadow if enabled
      this.enableShadow(ctx, values);
      ctx.fill();
      // disable shadows for other elements.
      this.disableShadow(ctx, values);
    }
  }

  /**
   * Set the shadow formatting values in the context if enabled, do nothing otherwise.
   *
   * @param ctx - The context that will be used for rendering.
   * @param values - Formatting values for the shadow.
   */
  public enableShadow(
    ctx: CanvasRenderingContext2D,
    values: SelectiveRequired<
      EdgeFormattingValues,
      "shadowColor" | "shadowSize" | "shadowX" | "shadowY"
    >
  ): void {
    if (values.shadow === true) {
      ctx.shadowColor = values.shadowColor;
      ctx.shadowBlur = values.shadowSize;
      ctx.shadowOffsetX = values.shadowX;
      ctx.shadowOffsetY = values.shadowY;
    }
  }

  /**
   * Reset the shadow formatting values in the context if enabled, do nothing otherwise.
   *
   * @param ctx - The context that will be used for rendering.
   * @param values - Formatting values for the shadow.
   */
  public disableShadow(
    ctx: CanvasRenderingContext2D,
    values: EdgeFormattingValues
  ): void {
    if (values.shadow === true) {
      ctx.shadowColor = "rgba(0,0,0,0)";
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
    }
  }

  /**
   * Render the background according to the formatting values.
   *
   * @param ctx - The context that will be used for rendering.
   * @param values - Formatting values for the background.
   */
  public drawBackground(
    ctx: CanvasRenderingContext2D,
    values: SelectiveRequired<
      EdgeFormattingValues,
      "backgroundColor" | "backgroundSize"
    >
  ): void {
    if (values.background !== false) {
      // save original line attrs
      const origCtxAttr = {
        strokeStyle: ctx.strokeStyle,
        lineWidth: ctx.lineWidth,
        dashes: (ctx as any).dashes,
      };

      ctx.strokeStyle = values.backgroundColor;
      ctx.lineWidth = values.backgroundSize;
      this.setStrokeDashed(ctx, values.backgroundDashes);

      ctx.stroke();

      // restore original line attrs
      ctx.strokeStyle = origCtxAttr.strokeStyle;
      ctx.lineWidth = origCtxAttr.lineWidth;
      (ctx as any).dashes = origCtxAttr.dashes;
      this.setStrokeDashed(ctx, values.dashes);
    }
  }

  /**
   * Set the line dash pattern if supported. Logs a warning to the console if it isn't supported.
   *
   * @param ctx - The context that will be used for rendering.
   * @param dashes - The pattern [line, space, line…], true for default dashed line or false for normal line.
   */
  public setStrokeDashed(
    ctx: CanvasRenderingContext2D,
    dashes?: boolean | number[]
  ): void {
    if (dashes !== false) {
      if (ctx.setLineDash !== undefined) {
        const pattern = Array.isArray(dashes) ? dashes : [5, 5];
        ctx.setLineDash(pattern);
      } else {
        console.warn(
          "setLineDash is not supported in this browser. The dashed stroke cannot be used."
        );
      }
    } else {
      if (ctx.setLineDash !== undefined) {
        ctx.setLineDash([]);
      } else {
        console.warn(
          "setLineDash is not supported in this browser. The dashed stroke cannot be used."
        );
      }
    }
  }
}
