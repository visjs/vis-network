interface CanvasRenderingContext2D {
    /**
     * Render a circle.
     *
     * @param x - The position of the center on the x axis.
     * @param y - The position of the center on the y axis.
     * @param r - The radius of the circle.
     */
    circle(x: number, y: number, r: number): void;
    /**
     * Render a dashed line.
     *
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
    dashedLine(x: number, y: number, x2: number, y2: number, pattern: number[]): void;
    /**
     * Render an isometric cylinder.
     *
     * @param x - The position of the center on the x axis.
     * @param y - The position of the center on the y axis.
     * @param w - The width of the database.
     * @param h - The height of the database.
     *
     * @remarks
     * http://stackoverflow.com/questions/2172798/how-to-draw-an-oval-in-html5-canvas
     */
    database(x: number, y: number, w: number, h: number): void;
    /**
     * Render a diamond.
     *
     * @param x - The position of the center on the x axis.
     * @param y - The position of the center on the y axis.
     * @param r - Half of the width and height of the diamond.
     *
     * @remarks
     * http://www.html5canvastutorials.com/labs/html5-canvas-star-spinner/
     */
    diamond(x: number, y: number, r: number): void;
    /**
     * Render an ellipse.
     *
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
    ellipse_vis(x: number, y: number, w: number, h: number): void;
    /**
     * Render a hexagon.
     *
     * @param x - The position of the center on the x axis.
     * @param y - The position of the center on the y axis.
     * @param r - The radius of the hexagon.
     */
    hexagon(x: number, y: number, r: number): void;
    /**
     * Render a rectangle with rounded corners.
     *
     * @param x - The position of the center on the x axis.
     * @param y - The position of the center on the y axis.
     * @param w - The width of the rectangle.
     * @param h - The height of the rectangle.
     * @param r - The radius of the corners.
     *
     * @remarks
     * http://stackoverflow.com/questions/1255512/how-to-draw-a-rounded-rectangle-on-html-canvas
     */
    roundRect(x: number, y: number, w: number, h: number, r: number): void;
    /**
     * Render a square.
     *
     * @param x - The position of the center on the x axis.
     * @param y - The position of the center on the y axis.
     * @param r - Half of the width and height of the square.
     */
    square(x: number, y: number, r: number): void;
    /**
     * Render a star.
     *
     * @param x - The position of the center on the x axis.
     * @param y - The position of the center on the y axis.
     * @param r - The outer radius of the star.
     */
    star(x: number, y: number, r: number): void;
    /**
     * Render an equilateral triangle standing on a side.
     *
     * @param x - The position of the center on the x axis.
     * @param y - The position of the center on the y axis.
     * @param r - Half of the length of the sides.
     *
     * @remarks
     * http://en.wikipedia.org/wiki/Equilateral_triangle
     */
    triangle(x: number, y: number, r: number): void;
    /**
     * Render an equilateral triangle standing on a vertex.
     *
     * @param x - The position of the center on the x axis.
     * @param y - The position of the center on the y axis.
     * @param r - Half of the length of the sides.
     *
     * @remarks
     * http://en.wikipedia.org/wiki/Equilateral_triangle
     */
    triangleDown(x: number, y: number, r: number): void;
}
//# sourceMappingURL=shapes.d.ts.map