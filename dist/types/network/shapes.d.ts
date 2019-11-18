/**
 * Draw a circle.
 *
 * @param ctx - The context this shape will be rendered to.
 * @param x - The position of the center on the x axis.
 * @param y - The position of the center on the y axis.
 * @param r - The radius of the circle.
 */
export declare function drawCircle(ctx: CanvasRenderingContext2D, x: number, y: number, r: number): void;
/**
 * Draw a square.
 *
 * @param ctx - The context this shape will be rendered to.
 * @param x - The position of the center on the x axis.
 * @param y - The position of the center on the y axis.
 * @param r - Half of the width and height of the square.
 */
export declare function drawSquare(ctx: CanvasRenderingContext2D, x: number, y: number, r: number): void;
/**
 * Draw an equilateral triangle standing on a side.
 *
 * @param ctx - The context this shape will be rendered to.
 * @param x - The position of the center on the x axis.
 * @param y - The position of the center on the y axis.
 * @param r - Half of the length of the sides.
 *
 * @remarks
 * http://en.wikipedia.org/wiki/Equilateral_triangle
 */
export declare function drawTriangle(ctx: CanvasRenderingContext2D, x: number, y: number, r: number): void;
/**
 * Draw an equilateral triangle standing on a vertex.
 *
 * @param ctx - The context this shape will be rendered to.
 * @param x - The position of the center on the x axis.
 * @param y - The position of the center on the y axis.
 * @param r - Half of the length of the sides.
 *
 * @remarks
 * http://en.wikipedia.org/wiki/Equilateral_triangle
 */
export declare function drawTriangleDown(ctx: CanvasRenderingContext2D, x: number, y: number, r: number): void;
/**
 * Draw a star.
 *
 * @param ctx - The context this shape will be rendered to.
 * @param x - The position of the center on the x axis.
 * @param y - The position of the center on the y axis.
 * @param r - The outer radius of the star.
 */
export declare function drawStar(ctx: CanvasRenderingContext2D, x: number, y: number, r: number): void;
/**
 * Draw a diamond.
 *
 * @param ctx - The context this shape will be rendered to.
 * @param x - The position of the center on the x axis.
 * @param y - The position of the center on the y axis.
 * @param r - Half of the width and height of the diamond.
 *
 * @remarks
 * http://www.html5canvastutorials.com/labs/html5-canvas-star-spinner/
 */
export declare function drawDiamond(ctx: CanvasRenderingContext2D, x: number, y: number, r: number): void;
/**
 * Draw a rectangle with rounded corners.
 *
 * @param ctx - The context this shape will be rendered to.
 * @param x - The position of the center on the x axis.
 * @param y - The position of the center on the y axis.
 * @param w - The width of the rectangle.
 * @param h - The height of the rectangle.
 * @param r - The radius of the corners.
 *
 * @remarks
 * http://stackoverflow.com/questions/1255512/how-to-draw-a-rounded-rectangle-on-html-canvas
 */
export declare function drawRoundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void;
/**
 * Draw an ellipse.
 *
 * @param ctx - The context this shape will be rendered to.
 * @param x - The position of the center on the x axis.
 * @param y - The position of the center on the y axis.
 * @param w - The width of the ellipse.
 * @param h - The height of the ellipse.
 *
 * @remarks
 * http://stackoverflow.com/questions/2172798/how-to-draw-an-oval-in-html5-canvas
 *
 * Postfix '_vis' added to discern it from standard method ellipse().
 */
export declare function drawEllipse(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number): void;
/**
 * Draw an isometric cylinder.
 *
 * @param ctx - The context this shape will be rendered to.
 * @param x - The position of the center on the x axis.
 * @param y - The position of the center on the y axis.
 * @param w - The width of the database.
 * @param h - The height of the database.
 *
 * @remarks
 * http://stackoverflow.com/questions/2172798/how-to-draw-an-oval-in-html5-canvas
 */
export declare function drawDatabase(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number): void;
/**
 * Draw a dashed line.
 *
 * @param ctx - The context this shape will be rendered to.
 * @param x - The start position on the x axis.
 * @param y - The start position on the y axis.
 * @param x2 - The end position on the x axis.
 * @param y2 - The end position on the y axis.
 * @param pattern - List of lengths starting with line and then alternating between space and line.
 *
 * @author David Jordan
 * @date 2012-08-08
 * @remarks
 * http://stackoverflow.com/questions/4576724/dotted-stroke-in-canvas
 */
export declare function drawDashedLine(ctx: CanvasRenderingContext2D, x: number, y: number, x2: number, y2: number, pattern: number[]): void;
/**
 * Draw a hexagon.
 *
 * @param ctx - The context this shape will be rendered to.
 * @param x - The position of the center on the x axis.
 * @param y - The position of the center on the y axis.
 * @param r - The radius of the hexagon.
 */
export declare function drawHexagon(ctx: CanvasRenderingContext2D, x: number, y: number, r: number): void;
declare const shapeMap: {
    circle: typeof drawCircle;
    dashedLine: typeof drawDashedLine;
    database: typeof drawDatabase;
    diamond: typeof drawDiamond;
    ellipse: typeof drawEllipse;
    ellipse_vis: typeof drawEllipse;
    hexagon: typeof drawHexagon;
    roundRect: typeof drawRoundRect;
    square: typeof drawSquare;
    star: typeof drawStar;
    triangle: typeof drawTriangle;
    triangleDown: typeof drawTriangleDown;
};
/**
 * Returns either custom or native drawing function base on supplied name.
 *
 * @param name - The name of the function. Either the name of a
 * CanvasRenderingContext2D property or an export from shapes.ts without the
 * draw prefix.
 *
 * @returns The function that can be used for rendering. In case of native
 * CanvasRenderingContext2D function the API is normalized to
 * `(ctx: CanvasRenderingContext2D, ...originalArgs) => void`.
 */
export declare function getShape(name: keyof CanvasRenderingContext2D | keyof typeof shapeMap): any;
export {};
//# sourceMappingURL=shapes.d.ts.map