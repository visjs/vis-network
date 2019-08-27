import { BezierEdgeBase } from "./util/bezier-edge-base";
import { EdgeFormattingValues, Label, EdgeOptions, Point, PointT, SelectiveRequired, VBody, VNode } from "./util/types";
/**
 * A Dynamic Bezier Edge. Bezier curves are used to model smooth gradual
 * curves in paths between nodes. The Dynamic piece refers to how the curve
 * reacts to physics changes.
 *
 * @extends BezierEdgeBase
 */
export declare class BezierEdgeDynamic extends BezierEdgeBase<Point> {
    via: VNode;
    private readonly _boundFunction;
    /**
     * Create a new instance.
     *
     * @param options - The options object of given edge.
     * @param body - The body of the network.
     * @param labelModule - Label module.
     */
    constructor(options: EdgeOptions, body: VBody, labelModule: Label);
    /** @inheritdoc */
    setOptions(options: EdgeOptions): void;
    /** @inheritdoc */
    connect(): void;
    /** @inheritdoc */
    cleanup(): boolean;
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
    setupSupportNode(): void;
    /**
     * Position bezier node.
     */
    positionBezierNode(): void;
    /** @inheritdoc */
    protected _line(ctx: CanvasRenderingContext2D, values: SelectiveRequired<EdgeFormattingValues, "backgroundColor" | "backgroundSize" | "shadowColor" | "shadowSize" | "shadowX" | "shadowY">, viaNode: VNode): void;
    /** @inheritdoc */
    protected _getViaCoordinates(): Point;
    /** @inheritdoc */
    getViaNode(): Point;
    /** @inheritdoc */
    getPoint(position: number, viaNode?: Point): Point;
    /** @inheritdoc */
    protected _findBorderPosition(nearNode: VNode, ctx: CanvasRenderingContext2D): PointT;
    /** @inheritdoc */
    protected _getDistanceToEdge(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number): number;
}
//# sourceMappingURL=bezier-edge-dynamic.d.ts.map