export declare type Id = string | number;
export declare type EdgeOptions = any;
export declare type VNode = any;
export interface VBody {
    nodes: Record<Id, VNode>;
    functions: {
        createNode(nodeOptions: unknown): VNode;
    };
    emitter: {
        on(name: string, ...args: unknown[]): void;
        off(name: string, ...args: unknown[]): void;
    };
    view: {
        scale: number;
    };
}
export declare type Label = {};
export interface Point {
    x: number;
    y: number;
}
export interface PointT extends Point {
    t: number;
}
export declare type SelectiveRequired<T, RequiredKey extends keyof Extract<T, object>> = T & {
    [Key in RequiredKey]-?: NonNullable<Extract<T, object>[Key]>;
};
export declare type ArrowType = "arrow" | "bar" | "box" | "circle" | "crow" | "curve" | "diamond" | "image" | "inv_curve" | "inv_triangle" | "triangle" | "vee";
export declare type ColorInheritance = boolean | "both" | "from" | "to";
export interface CachedImage {
    width: number;
    height: number;
    drawImageAtPosition(ctx: CanvasRenderingContext2D, factor: number, left: number, top: number, width?: number, height?: number): void;
}
export interface ArrowData {
    angle: number;
    image?: CachedImage;
    imageHeight?: number;
    imageWidth?: number;
    length: number;
    point: Point;
    type: ArrowType;
}
export interface ArrowDataWithCore extends ArrowData {
    core: Point;
}
export interface EdgeFormattingValues {
    arrowStrikethrough?: boolean;
    background?: boolean;
    backgroundColor?: string;
    backgroundDashes?: boolean | number[];
    backgroundSize?: number;
    color?: string;
    dashes?: boolean | number[];
    fromArrow?: boolean;
    fromArrowScale?: number;
    fromArrowType?: ArrowType;
    hidden?: boolean;
    inheritsColor?: ColorInheritance;
    length?: number;
    middleArrow?: boolean;
    middleArrowScale?: number;
    middleArrowType?: ArrowType;
    opacity?: number;
    shadow?: boolean;
    shadowColor?: string;
    shadowSize?: number;
    shadowX?: number;
    shadowY?: number;
    toArrow?: boolean;
    toArrowScale?: number;
    toArrowType?: ArrowType;
    width?: number;
}
export interface EdgeType {
    hoverWidth: number;
    selectionWidth: number;
    from: VNode;
    fromPoint: Point;
    to: VNode;
    toPoint: Point;
    via?: VNode;
    viaPoint?: Point;
    /**
     * Find the intersection between the borders of the nodes and the edge.
     *
     * @param ctx - The context that will be used for rendering.
     * @returns Cartesian coordinates of the intersections between the borders of the nodes and the edge.
     */
    findBorderPositions(ctx: CanvasRenderingContext2D): {
        from: Point;
        to: Point;
    };
    /**
     * Remove additional nodes if some were created.
     *
     * @returns True if something was cleared, false otherwise.
     */
    cleanup(): boolean;
    /**
     * Connect a node to itself.
     */
    connect(): void;
    /**
     * Find a point on the edge corresponding to given position on the edge.
     *
     * @param position - The position on the edge (0 is from and 1 is to node).
     * @param viaNode - Additional control point(s) for the edge.
     * @returns Cartesian coordinates of the requested point on the edge.
     */
    getPoint(percentage: number): Point;
    /**
     * Set new edge options.
     *
     * @param options - The new edge options object.
     */
    setOptions(options: EdgeOptions): void;
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
    getDistanceToEdge(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number): number;
    /**
     * Redraw a edge as a line
     * Draw this edge in the given canvas
     * The 2d context of a HTML canvas can be retrieved by canvas.getContext("2d");
     *
     * @param ctx - The context that will be used for rendering.
     * @param values - Formatting values like color, opacity or shadow.
     * @param _selected - Ignored (TODO: remove in the future).
     * @param _hover - Ignored (TODO: remove in the future).
     * @param viaNode - Additional control point(s) for the edge.
     */
    drawLine(ctx: CanvasRenderingContext2D, values: SelectiveRequired<EdgeFormattingValues, "color" | "opacity" | "shadowColor" | "shadowSize" | "shadowX" | "shadowY" | "width">): void;
    /**
     * Reander an arrow head.
     *
     * @param ctx - The context that will be used for rendering.
     * @param values - Formatting values with color, opacity, etc.
     * @param _selected - Ignored (TODO: remove in the future).
     * @param _hover - Ignored (TODO: remove in the future).
     * @param arrowData - The data determining the position, angle and so on of the arrow.
     */
    drawArrowHead(ctx: CanvasRenderingContext2D, values: SelectiveRequired<EdgeFormattingValues, "opacity" | "shadowColor" | "shadowSize" | "shadowX" | "shadowY" | "width">, selected: boolean, hover: boolean, arrowData: ArrowData): void;
    /**
     * Prepare data that can be used to render a middle arrow.
     *
     * @param ctx - The context that will be used for rendering.
     * @param position - Determines where on the edge should the arrow be rendered.
     * @param viaNode - Additional control point(s) for the edge.
     * @param _selected - Ignored (TODO: remove in the future).
     * @param _hover - Ignored (TODO: remove in the future).
     * @param values - Formatting values determining the style of the edge.
     * @returns Data that can be used to render the requested arrows.
     */
    getArrowData(ctx: CanvasRenderingContext2D, position: "middle", viaNode: VNode, selected: boolean, hover: boolean, values: SelectiveRequired<EdgeFormattingValues, "middleArrowType" | "middleArrowScale" | "width">): ArrowDataWithCore;
    /**
     * Prepare data that can be used to render a to arrow.
     *
     * @param ctx - The context that will be used for rendering.
     * @param position - Determines where on the edge should the arrow be rendered.
     * @param viaNode - Additional control point(s) for the edge.
     * @param _selected - Ignored (TODO: remove in the future).
     * @param _hover - Ignored (TODO: remove in the future).
     * @param values - Formatting values determining the style of the edge.
     * @returns Data that can be used to render the requested arrows.
     */
    getArrowData(ctx: CanvasRenderingContext2D, position: "to", viaNode: VNode, selected: boolean, hover: boolean, values: SelectiveRequired<EdgeFormattingValues, "toArrowType" | "toArrowScale" | "width">): ArrowDataWithCore;
    /**
     * Prepare data that can be used to render a from arrow.
     *
     * @param ctx - The context that will be used for rendering.
     * @param position - Determines where on the edge should the arrow be rendered.
     * @param viaNode - Additional control point(s) for the edge.
     * @param _selected - Ignored (TODO: remove in the future).
     * @param _hover - Ignored (TODO: remove in the future).
     * @param values - Formatting values determining the style of the edge.
     * @returns Data that can be used to render the requested arrows.
     */
    getArrowData(ctx: CanvasRenderingContext2D, position: "from", viaNode: VNode, selected: boolean, hover: boolean, values: SelectiveRequired<EdgeFormattingValues, "fromArrowType" | "fromArrowScale" | "width">): ArrowDataWithCore;
}
//# sourceMappingURL=types.d.ts.map