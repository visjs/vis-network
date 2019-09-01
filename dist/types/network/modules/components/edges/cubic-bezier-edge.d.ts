import { CubicBezierEdgeBase } from "./util/cubic-bezier-edge-base";
import { EdgeFormattingValues, Label, EdgeOptions, Point, PointT, SelectiveRequired, VBody, VNode } from "./util/types";
/**
 * A Cubic Bezier Edge. Bezier curves are used to model smooth gradual curves in paths between nodes.
 */
export declare class CubicBezierEdge extends CubicBezierEdgeBase<[Point, Point]> {
    /**
     * Create a new instance.
     *
     * @param options - The options object of given edge.
     * @param body - The body of the network.
     * @param labelModule - Label module.
     */
    constructor(options: EdgeOptions, body: VBody, labelModule: Label);
    /** @inheritdoc */
    protected _line(ctx: CanvasRenderingContext2D, values: SelectiveRequired<EdgeFormattingValues, "backgroundColor" | "backgroundSize" | "shadowColor" | "shadowSize" | "shadowX" | "shadowY">, viaNodes: [Point, Point]): void;
    /**
     * Compute the additional points the edge passes through.
     *
     * @returns Cartesian coordinates of the points the edge passes through.
     */
    protected _getViaCoordinates(): [Point, Point];
    /** @inheritdoc */
    getViaNode(): [Point, Point];
    /** @inheritdoc */
    protected _findBorderPosition(nearNode: VNode, ctx: CanvasRenderingContext2D): PointT;
    /** @inheritdoc */
    protected _getDistanceToEdge(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, [via1, via2]?: [Point, Point]): number;
    /** @inheritdoc */
    getPoint(position: number, [via1, via2]?: [Point, Point]): Point;
}
//# sourceMappingURL=cubic-bezier-edge.d.ts.map