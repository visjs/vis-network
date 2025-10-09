import { CubicBezierEdgeBase } from "./util/cubic-bezier-edge-base.ts";
import type { EdgeFormattingValues, Point, PointT, SelectiveRequired, VNode } from "./util/types.ts";
/**
 * A Cubic Bezier Edge. Bezier curves are used to model smooth gradual curves in paths between nodes.
 */
export declare class CubicBezierEdge extends CubicBezierEdgeBase<[Point, Point]> {
    /** @inheritDoc */
    protected _line(ctx: CanvasRenderingContext2D, values: SelectiveRequired<EdgeFormattingValues, "backgroundColor" | "backgroundSize" | "shadowColor" | "shadowSize" | "shadowX" | "shadowY">, viaNodes: [Point, Point]): void;
    /**
     * Compute the additional points the edge passes through.
     * @returns Cartesian coordinates of the points the edge passes through.
     */
    protected _getViaCoordinates(): [Point, Point];
    /** @inheritDoc */
    getViaNode(): [Point, Point];
    /** @inheritDoc */
    protected _findBorderPosition(nearNode: VNode, ctx: CanvasRenderingContext2D): PointT;
    /** @inheritDoc */
    protected _getDistanceToEdge(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, [via1, via2]?: [Point, Point]): number;
    /** @inheritDoc */
    getPoint(position: number, [via1, via2]?: [Point, Point]): Point;
}
//# sourceMappingURL=cubic-bezier-edge.d.ts.map