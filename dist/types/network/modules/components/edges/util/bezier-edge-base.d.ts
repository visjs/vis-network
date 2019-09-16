import { EdgeBase } from "./edge-base";
import { EdgeFormattingValues, Label, EdgeOptions, Point, PointT, SelectiveRequired, VBody, VNode } from "./types";
/**
 * The Base Class for all Bezier edges.
 * Bezier curves are used to model smooth gradual curves in paths between nodes.
 */
export declare abstract class BezierEdgeBase<Via> extends EdgeBase<Via> {
    /**
     * Create a new instance.
     *
     * @param options - The options object of given edge.
     * @param body - The body of the network.
     * @param labelModule - Label module.
     */
    constructor(options: EdgeOptions, body: VBody, labelModule: Label);
    /**
     * Compute additional point(s) the edge passes through.
     *
     * @returns Cartesian coordinates of the point(s) the edge passes through.
     */
    protected abstract _getViaCoordinates(): Via;
    /**
     * Find the intersection between the border of the node and the edge.
     *
     * @remarks
     * This function uses binary search to look for the point where the bezier curve crosses the border of the node.
     *
     * @param nearNode - The node (either from or to node of the edge).
     * @param ctx - The context that will be used for rendering.
     * @param viaNode - Additional node(s) the edge passes through.
     *
     * @returns Cartesian coordinates of the intersection between the border of the node and the edge.
     */
    protected _findBorderPositionBezier(nearNode: VNode, ctx: CanvasRenderingContext2D, viaNode?: Via): PointT;
    /**
     * Calculate the distance between a point (x3,y3) and a line segment from (x1,y1) to (x2,y2).
     *
     * @remarks
     * http://stackoverflow.com/questions/849211/shortest-distancae-between-a-point-and-a-line-segment
     *
     * @param x1 - First end of the line segment on the x axis.
     * @param y1 - First end of the line segment on the y axis.
     * @param x2 - Second end of the line segment on the x axis.
     * @param y2 - Second end of the line segment on the y axis.
     * @param x3 - Position of the point on the x axis.
     * @param y3 - Position of the point on the y axis.
     * @param via - The control point for the edge.
     *
     * @returns The distance between the line segment and the point.
     */
    protected _getDistanceToBezierEdge(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, via: Point): number;
    /**
     * Render a bezier curve between two nodes.
     *
     * @remarks
     * The method accepts zero, one or two control points.
     * Passing zero control points just draws a straight line.
     *
     * @param ctx - The context that will be used for rendering.
     * @param values - Style options for edge drawing.
     * @param viaNode1 - First control point for curve drawing.
     * @param viaNode2 - Second control point for curve drawing.
     */
    protected _bezierCurve(ctx: CanvasRenderingContext2D, values: SelectiveRequired<EdgeFormattingValues, "backgroundColor" | "backgroundSize" | "shadowColor" | "shadowSize" | "shadowX" | "shadowY">, viaNode1?: Point, viaNode2?: Point): void;
    /** @inheritdoc */
    getViaNode(): Via;
}
//# sourceMappingURL=bezier-edge-base.d.ts.map