import { ArrowData, ArrowDataWithCore, EdgeFormattingValues, EdgeType, Id, Label, EdgeOptions, Point, PointT, SelectiveRequired, VBody, VNode } from "./types";
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
export declare abstract class EdgeBase<Via = undefined> implements EdgeType {
    protected _body: VBody;
    protected _labelModule: Label;
    from: VNode;
    fromPoint: Point;
    to: VNode;
    toPoint: Point;
    via?: VNode;
    color: unknown;
    colorDirty: boolean;
    id: Id;
    options: EdgeOptions;
    hoverWidth: number;
    selectionWidth: number;
    /**
     * Create a new instance.
     *
     * @param options - The options object of given edge.
     * @param _body - The body of the network.
     * @param _labelModule - Label module.
     */
    constructor(options: EdgeOptions, _body: VBody, _labelModule: Label);
    /**
     * Find the intersection between the border of the node and the edge.
     *
     * @param node - The node (either from or to node of the edge).
     * @param ctx - The context that will be used for rendering.
     * @param options - Additional options.
     *
     * @returns Cartesian coordinates of the intersection between the border of the node and the edge.
     */
    protected abstract _findBorderPosition(node: VNode, ctx: CanvasRenderingContext2D, options?: FindBorderPositionOptions<Via>): PointT;
    /**
     * Return additional point(s) the edge passes through.
     *
     * @returns Cartesian coordinates of the point(s) the edge passes through.
     */
    abstract getViaNode(): Via;
    /** @inheritdoc */
    abstract getPoint(position: number, viaNode?: Via): Point;
    /** @inheritdoc */
    connect(): void;
    /** @inheritdoc */
    cleanup(): boolean;
    /**
     * Set new edge options.
     *
     * @param options - The new edge options object.
     */
    setOptions(options: EdgeOptions): void;
    /** @inheritdoc */
    drawLine(ctx: CanvasRenderingContext2D, values: SelectiveRequired<EdgeFormattingValues, "color" | "opacity" | "shadowColor" | "shadowSize" | "shadowX" | "shadowY" | "width">, _selected?: boolean, _hover?: boolean, viaNode?: Via): void;
    /**
     * Draw a line with given style between two nodes through supplied node(s).
     *
     * @param ctx - The context that will be used for rendering.
     * @param values - Formatting values like color, opacity or shadow.
     * @param viaNode - Additional control point(s) for the edge.
     * @param fromPoint - TODO: Seems ignored, remove?
     * @param toPoint - TODO: Seems ignored, remove?
     */
    private _drawLine;
    /**
     * Draw a dashed line with given style between two nodes through supplied node(s).
     *
     * @param ctx - The context that will be used for rendering.
     * @param values - Formatting values like color, opacity or shadow.
     * @param viaNode - Additional control point(s) for the edge.
     * @param _fromPoint - Ignored (TODO: remove in the future).
     * @param _toPoint - Ignored (TODO: remove in the future).
     */
    private _drawDashedLine;
    /**
     * Draw a line with given style between two nodes through supplied node(s).
     *
     * @param ctx - The context that will be used for rendering.
     * @param values - Formatting values like color, opacity or shadow.
     * @param viaNode - Additional control point(s) for the edge.
     * @param fromPoint - TODO: Seems ignored, remove?
     * @param toPoint - TODO: Seems ignored, remove?
     */
    protected abstract _line(ctx: CanvasRenderingContext2D, values: EdgeFormattingValues, viaNode: Via, fromPoint?: Point, toPoint?: Point): void;
    /**
     * Find the intersection between the border of the node and the edge.
     *
     * @param node - The node (either from or to node of the edge).
     * @param ctx - The context that will be used for rendering.
     * @param options - Additional options.
     *
     * @returns Cartesian coordinates of the intersection between the border of the node and the edge.
     */
    findBorderPosition(node: VNode, ctx: CanvasRenderingContext2D, options?: FindBorderPositionOptions<Via> | FindBorderPositionCircleOptions): PointT;
    /** @inheritdoc */
    findBorderPositions(ctx: CanvasRenderingContext2D): {
        from: Point;
        to: Point;
    };
    /**
     * Compute the center point and radius of an edge connected to the same node at both ends.
     *
     * @param ctx - The context that will be used for rendering.
     *
     * @returns `[x, y, radius]`
     */
    protected _getCircleData(ctx?: CanvasRenderingContext2D): [number, number, number];
    /**
     * Get a point on a circle.
     *
     * @param x - Center of the circle on the x axis.
     * @param y - Center of the circle on the y axis.
     * @param radius - Radius of the circle.
     * @param position - Value between 0 (line start) and 1 (line end).
     *
     * @returns Cartesian coordinates of requested point on the circle.
     */
    private _pointOnCircle;
    /**
     * Find the intersection between the border of the node and the edge.
     *
     * @remarks
     * This function uses binary search to look for the point where the circle crosses the border of the node.
     *
     * @param nearNode - The node (either from or to node of the edge).
     * @param ctx - The context that will be used for rendering.
     * @param options - Additional options.
     *
     * @returns Cartesian coordinates of the intersection between the border of the node and the edge.
     */
    private _findBorderPositionCircle;
    /**
     * Get the line width of the edge. Depends on width and whether one of the connected nodes is selected.
     *
     * @param selected - Determines wheter the line is selected.
     * @param hover - Determines wheter the line is being hovered, only applies if selected is false.
     *
     * @returns The width of the line.
     */
    getLineWidth(selected: boolean, hover: boolean): number;
    /**
     * Compute the color or gradient for given edge.
     *
     * @param ctx - The context that will be used for rendering.
     * @param values - Formatting values like color, opacity or shadow.
     * @param _selected - Ignored (TODO: remove in the future).
     * @param _hover - Ignored (TODO: remove in the future).
     *
     * @returns Color string if single color is inherited or gradient if two.
     */
    getColor(ctx: CanvasRenderingContext2D, values: SelectiveRequired<EdgeFormattingValues, "color" | "opacity">): string | CanvasGradient;
    /**
     * Draw a line from a node to itself, a circle.
     *
     * @param ctx - The context that will be used for rendering.
     * @param values - Formatting values like color, opacity or shadow.
     * @param x - Center of the circle on the x axis.
     * @param y - Center of the circle on the y axis.
     * @param radius - Radius of the circle.
     */
    private _circle;
    /**
     * @inheritdoc
     *
     * @remarks
     * http://stackoverflow.com/questions/849211/shortest-distancae-between-a-point-and-a-line-segment
     */
    getDistanceToEdge(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number): number;
    /**
     * Calculate the distance between a point (x3, y3) and a line segment from (x1, y1) to (x2, y2).
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
     * @param via - Additional control point(s) for the edge.
     *
     * @returns The distance between the line segment and the point.
     */
    protected abstract _getDistanceToEdge(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, via?: Via): number;
    /**
     * Calculate the distance between a point (x3, y3) and a line segment from (x1, y1) to (x2, y2).
     *
     * @param x1 - First end of the line segment on the x axis.
     * @param y1 - First end of the line segment on the y axis.
     * @param x2 - Second end of the line segment on the x axis.
     * @param y2 - Second end of the line segment on the y axis.
     * @param x3 - Position of the point on the x axis.
     * @param y3 - Position of the point on the y axis.
     *
     * @returns The distance between the line segment and the point.
     */
    protected _getDistanceToLine(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number): number;
    /** @inheritdoc */
    getArrowData(ctx: CanvasRenderingContext2D, position: "middle", viaNode: VNode, selected: boolean, hover: boolean, values: SelectiveRequired<EdgeFormattingValues, "middleArrowType" | "middleArrowScale" | "width">): ArrowDataWithCore;
    /** @inheritdoc */
    getArrowData(ctx: CanvasRenderingContext2D, position: "to", viaNode: VNode, selected: boolean, hover: boolean, values: SelectiveRequired<EdgeFormattingValues, "toArrowType" | "toArrowScale" | "width">): ArrowDataWithCore;
    /** @inheritdoc */
    getArrowData(ctx: CanvasRenderingContext2D, position: "from", viaNode: VNode, selected: boolean, hover: boolean, values: SelectiveRequired<EdgeFormattingValues, "fromArrowType" | "fromArrowScale" | "width">): ArrowDataWithCore;
    /** @inheritdoc */
    drawArrowHead(ctx: CanvasRenderingContext2D, values: SelectiveRequired<EdgeFormattingValues, "color" | "opacity" | "shadowColor" | "shadowSize" | "shadowX" | "shadowY" | "width">, _selected: boolean, _hover: boolean, arrowData: ArrowData): void;
    /**
     * Set the shadow formatting values in the context if enabled, do nothing otherwise.
     *
     * @param ctx - The context that will be used for rendering.
     * @param values - Formatting values for the shadow.
     */
    enableShadow(ctx: CanvasRenderingContext2D, values: SelectiveRequired<EdgeFormattingValues, "shadowColor" | "shadowSize" | "shadowX" | "shadowY">): void;
    /**
     * Reset the shadow formatting values in the context if enabled, do nothing otherwise.
     *
     * @param ctx - The context that will be used for rendering.
     * @param values - Formatting values for the shadow.
     */
    disableShadow(ctx: CanvasRenderingContext2D, values: EdgeFormattingValues): void;
    /**
     * Render the background according to the formatting values.
     *
     * @param ctx - The context that will be used for rendering.
     * @param values - Formatting values for the background.
     */
    drawBackground(ctx: CanvasRenderingContext2D, values: SelectiveRequired<EdgeFormattingValues, "backgroundColor" | "backgroundSize">): void;
    /**
     * Set the line dash pattern if supported. Logs a warning to the console if it isn't supported.
     *
     * @param ctx - The context that will be used for rendering.
     * @param dashes - The pattern [line, space, line…], true for default dashed line or false for normal line.
     */
    setStrokeDashed(ctx: CanvasRenderingContext2D, dashes?: boolean | number[]): void;
}
//# sourceMappingURL=edge-base.d.ts.map