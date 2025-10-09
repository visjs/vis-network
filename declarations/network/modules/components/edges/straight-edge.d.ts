import { EdgeBase } from "./util/edge-base.ts";
import type { EdgeFormattingValues, Point, PointT, SelectiveRequired, VNode } from "./util/types.ts";
/**
 * A Straight Edge.
 */
export declare class StraightEdge extends EdgeBase {
    /** @inheritDoc */
    protected _line(ctx: CanvasRenderingContext2D, values: SelectiveRequired<EdgeFormattingValues, "shadowColor" | "shadowSize" | "shadowX" | "shadowY">): void;
    /** @inheritDoc */
    getViaNode(): undefined;
    /** @inheritDoc */
    getPoint(position: number): Point;
    /** @inheritDoc */
    protected _findBorderPosition(nearNode: VNode, ctx: CanvasRenderingContext2D): PointT;
    /** @inheritDoc */
    protected _getDistanceToEdge(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number): number;
}
//# sourceMappingURL=straight-edge.d.ts.map