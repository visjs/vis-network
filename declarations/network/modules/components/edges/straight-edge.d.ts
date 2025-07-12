import { EdgeBase } from "./util/edge-base.ts";
import type { EdgeFormattingValues, Label, EdgeOptions, Point, PointT, SelectiveRequired, VBody, VNode } from "./util/types.ts";
/**
 * A Straight Edge.
 */
export declare class StraightEdge extends EdgeBase {
    /**
     * Create a new instance.
     * @param options - The options object of given edge.
     * @param body - The body of the network.
     * @param labelModule - Label module.
     */
    constructor(options: EdgeOptions, body: VBody, labelModule: Label);
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