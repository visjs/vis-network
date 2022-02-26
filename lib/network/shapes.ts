/**
 * Draw a circle.
 *
 * @param ctx - The context this shape will be rendered to.
 * @param x - The position of the center on the x axis.
 * @param y - The position of the center on the y axis.
 * @param r - The radius of the circle.
 */
export function drawCircle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number
): void {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, 2 * Math.PI, false);
  ctx.closePath();
}

/**
 * Draw a square.
 *
 * @param ctx - The context this shape will be rendered to.
 * @param x - The position of the center on the x axis.
 * @param y - The position of the center on the y axis.
 * @param r - Half of the width and height of the square.
 */
export function drawSquare(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number
): void {
  ctx.beginPath();
  ctx.rect(x - r, y - r, r * 2, r * 2);
  ctx.closePath();
}

/**
 * Draw an equilateral triangle standing on a side.
 *
 * @param ctx - The context this shape will be rendered to.
 * @param x - The position of the center on the x axis.
 * @param y - The position of the center on the y axis.
 * @param r - Half of the length of the sides.
 * @remarks
 * http://en.wikipedia.org/wiki/Equilateral_triangle
 */
export function drawTriangle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number
): void {
  ctx.beginPath();

  // the change in radius and the offset is here to center the shape
  r *= 1.15;
  y += 0.275 * r;

  const s = r * 2;
  const s2 = s / 2;
  const ir = (Math.sqrt(3) / 6) * s; // radius of inner circle
  const h = Math.sqrt(s * s - s2 * s2); // height

  ctx.moveTo(x, y - (h - ir));
  ctx.lineTo(x + s2, y + ir);
  ctx.lineTo(x - s2, y + ir);
  ctx.lineTo(x, y - (h - ir));
  ctx.closePath();
}

/**
 * Draw an equilateral triangle standing on a vertex.
 *
 * @param ctx - The context this shape will be rendered to.
 * @param x - The position of the center on the x axis.
 * @param y - The position of the center on the y axis.
 * @param r - Half of the length of the sides.
 * @remarks
 * http://en.wikipedia.org/wiki/Equilateral_triangle
 */
export function drawTriangleDown(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number
): void {
  ctx.beginPath();

  // the change in radius and the offset is here to center the shape
  r *= 1.15;
  y -= 0.275 * r;

  const s = r * 2;
  const s2 = s / 2;
  const ir = (Math.sqrt(3) / 6) * s; // radius of inner circle
  const h = Math.sqrt(s * s - s2 * s2); // height

  ctx.moveTo(x, y + (h - ir));
  ctx.lineTo(x + s2, y - ir);
  ctx.lineTo(x - s2, y - ir);
  ctx.lineTo(x, y + (h - ir));
  ctx.closePath();
}

/**
 * Draw a star.
 *
 * @param ctx - The context this shape will be rendered to.
 * @param x - The position of the center on the x axis.
 * @param y - The position of the center on the y axis.
 * @param r - The outer radius of the star.
 */
export function drawStar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number
): void {
  // http://www.html5canvastutorials.com/labs/html5-canvas-star-spinner/
  ctx.beginPath();

  // the change in radius and the offset is here to center the shape
  r *= 0.82;
  y += 0.1 * r;

  for (let n = 0; n < 10; n++) {
    const radius = n % 2 === 0 ? r * 1.3 : r * 0.5;
    ctx.lineTo(
      x + radius * Math.sin((n * 2 * Math.PI) / 10),
      y - radius * Math.cos((n * 2 * Math.PI) / 10)
    );
  }

  ctx.closePath();
}

/**
 * Draw a diamond.
 *
 * @param ctx - The context this shape will be rendered to.
 * @param x - The position of the center on the x axis.
 * @param y - The position of the center on the y axis.
 * @param r - Half of the width and height of the diamond.
 * @remarks
 * http://www.html5canvastutorials.com/labs/html5-canvas-star-spinner/
 */
export function drawDiamond(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number
): void {
  ctx.beginPath();

  ctx.lineTo(x, y + r);
  ctx.lineTo(x + r, y);
  ctx.lineTo(x, y - r);
  ctx.lineTo(x - r, y);

  ctx.closePath();
}

/**
 * Draw a rectangle with rounded corners.
 *
 * @param ctx - The context this shape will be rendered to.
 * @param x - The position of the center on the x axis.
 * @param y - The position of the center on the y axis.
 * @param w - The width of the rectangle.
 * @param h - The height of the rectangle.
 * @param r - The radius of the corners.
 * @remarks
 * http://stackoverflow.com/questions/1255512/how-to-draw-a-rounded-rectangle-on-html-canvas
 */
export function drawRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
): void {
  const r2d = Math.PI / 180;
  if (w - 2 * r < 0) {
    r = w / 2;
  } //ensure that the radius isn't too large for x
  if (h - 2 * r < 0) {
    r = h / 2;
  } //ensure that the radius isn't too large for y
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arc(x + w - r, y + r, r, r2d * 270, r2d * 360, false);
  ctx.lineTo(x + w, y + h - r);
  ctx.arc(x + w - r, y + h - r, r, 0, r2d * 90, false);
  ctx.lineTo(x + r, y + h);
  ctx.arc(x + r, y + h - r, r, r2d * 90, r2d * 180, false);
  ctx.lineTo(x, y + r);
  ctx.arc(x + r, y + r, r, r2d * 180, r2d * 270, false);
  ctx.closePath();
}

/**
 * Draw an ellipse.
 *
 * @param ctx - The context this shape will be rendered to.
 * @param x - The position of the center on the x axis.
 * @param y - The position of the center on the y axis.
 * @param w - The width of the ellipse.
 * @param h - The height of the ellipse.
 * @remarks
 * http://stackoverflow.com/questions/2172798/how-to-draw-an-oval-in-html5-canvas
 *
 * Postfix '_vis' added to discern it from standard method ellipse().
 */
export function drawEllipse(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number
): void {
  const kappa = 0.5522848,
    ox = (w / 2) * kappa, // control point offset horizontal
    oy = (h / 2) * kappa, // control point offset vertical
    xe = x + w, // x-end
    ye = y + h, // y-end
    xm = x + w / 2, // x-middle
    ym = y + h / 2; // y-middle

  ctx.beginPath();
  ctx.moveTo(x, ym);
  ctx.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
  ctx.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
  ctx.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
  ctx.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);
  ctx.closePath();
}

/**
 * Draw an isometric cylinder.
 *
 * @param ctx - The context this shape will be rendered to.
 * @param x - The position of the center on the x axis.
 * @param y - The position of the center on the y axis.
 * @param w - The width of the database.
 * @param h - The height of the database.
 * @remarks
 * http://stackoverflow.com/questions/2172798/how-to-draw-an-oval-in-html5-canvas
 */
export function drawDatabase(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number
): void {
  const f = 1 / 3;
  const wEllipse = w;
  const hEllipse = h * f;

  const kappa = 0.5522848,
    ox = (wEllipse / 2) * kappa, // control point offset horizontal
    oy = (hEllipse / 2) * kappa, // control point offset vertical
    xe = x + wEllipse, // x-end
    ye = y + hEllipse, // y-end
    xm = x + wEllipse / 2, // x-middle
    ym = y + hEllipse / 2, // y-middle
    ymb = y + (h - hEllipse / 2), // y-midlle, bottom ellipse
    yeb = y + h; // y-end, bottom ellipse

  ctx.beginPath();
  ctx.moveTo(xe, ym);

  ctx.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
  ctx.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);

  ctx.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
  ctx.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);

  ctx.lineTo(xe, ymb);

  ctx.bezierCurveTo(xe, ymb + oy, xm + ox, yeb, xm, yeb);
  ctx.bezierCurveTo(xm - ox, yeb, x, ymb + oy, x, ymb);

  ctx.lineTo(x, ym);
}

/**
 * Draw a dashed line.
 *
 * @param ctx - The context this shape will be rendered to.
 * @param x - The start position on the x axis.
 * @param y - The start position on the y axis.
 * @param x2 - The end position on the x axis.
 * @param y2 - The end position on the y axis.
 * @param pattern - List of lengths starting with line and then alternating between space and line.
 * @author David Jordan
 * @remarks
 * date 2012-08-08
 * http://stackoverflow.com/questions/4576724/dotted-stroke-in-canvas
 */
export function drawDashedLine(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  x2: number,
  y2: number,
  pattern: number[]
): void {
  ctx.beginPath();
  ctx.moveTo(x, y);

  const patternLength = pattern.length;
  const dx = x2 - x;
  const dy = y2 - y;
  const slope = dy / dx;
  let distRemaining = Math.sqrt(dx * dx + dy * dy);
  let patternIndex = 0;
  let draw = true;
  let xStep = 0;
  let dashLength = +pattern[0];

  while (distRemaining >= 0.1) {
    dashLength = +pattern[patternIndex++ % patternLength];
    if (dashLength > distRemaining) {
      dashLength = distRemaining;
    }

    xStep = Math.sqrt((dashLength * dashLength) / (1 + slope * slope));
    xStep = dx < 0 ? -xStep : xStep;
    x += xStep;
    y += slope * xStep;

    if (draw === true) {
      ctx.lineTo(x, y);
    } else {
      ctx.moveTo(x, y);
    }

    distRemaining -= dashLength;
    draw = !draw;
  }
}

/**
 * Draw a hexagon.
 *
 * @param ctx - The context this shape will be rendered to.
 * @param x - The position of the center on the x axis.
 * @param y - The position of the center on the y axis.
 * @param r - The radius of the hexagon.
 */
export function drawHexagon(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number
): void {
  ctx.beginPath();
  const sides = 6;
  const a = (Math.PI * 2) / sides;
  ctx.moveTo(x + r, y);
  for (let i = 1; i < sides; i++) {
    ctx.lineTo(x + r * Math.cos(a * i), y + r * Math.sin(a * i));
  }
  ctx.closePath();
}

const shapeMap = {
  circle: drawCircle,
  dashedLine: drawDashedLine,
  database: drawDatabase,
  diamond: drawDiamond,
  ellipse: drawEllipse,
  ellipse_vis: drawEllipse,
  hexagon: drawHexagon,
  roundRect: drawRoundRect,
  square: drawSquare,
  star: drawStar,
  triangle: drawTriangle,
  triangleDown: drawTriangleDown,
};

/**
 * Returns either custom or native drawing function base on supplied name.
 *
 * @param name - The name of the function. Either the name of a
 * CanvasRenderingContext2D property or an export from shapes.ts without the
 * draw prefix.
 * @returns The function that can be used for rendering. In case of native
 * CanvasRenderingContext2D function the API is normalized to
 * `(ctx: CanvasRenderingContext2D, ...originalArgs) => void`.
 */
export function getShape(
  name: keyof CanvasRenderingContext2D | keyof typeof shapeMap
): any {
  if (Object.prototype.hasOwnProperty.call(shapeMap, name)) {
    return (shapeMap as any)[name];
  } else {
    return function (ctx: CanvasRenderingContext2D, ...args: any[]): void {
      (CanvasRenderingContext2D.prototype as any)[name].call(ctx, args);
    };
  }
}
