import { EdgeBase } from "./util/edge-base";
import { EdgeFormattingValues, Label, EdgeOptions, Point, PointT, SelectiveRequired, VBody, VNode } from "./util/types";
/**
 * A Straight Edge.
 */
export declare class StraightEdge extends EdgeBase {
    /**
     * Create a new instance.
     *
     * @param options - The options object of given edge.
     * @param body - The body of the network.
     * @param labelModule - Label module.
     */
    constructor(options: EdgeOptions, body: VBody, labelModule: Label);
    /** @inheritdoc */
    protected _line(ctx: CanvasRenderingContext2D, values: SelectiveRequired<EdgeFormattingValues, "shadowColor" | "shadowSize" | "shadowX" | "shadowY">): void;
    /** @inheritdoc */
    getViaNode(): undefined;
    /** @inheritdoc */
    getPoint(position: number): Point;
    /** @inheritdoc */
    protected _findBorderPosition(nearNode: VNode, ctx: CanvasRenderingContext2D): PointT;
    /** @inheritdoc */
    protected _getDistanceToEdge(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number): number;
}
//# sourceMappingURL=straight-edge.d.ts.map