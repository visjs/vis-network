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
  dashedLine(
    x: number,
    y: number,
    x2: number,
    y2: number,
    pattern: number[]
  ): void;

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

/*
 * Canvas shapes used by Network
 */
if (typeof CanvasRenderingContext2D !== "undefined") {
  CanvasRenderingContext2D.prototype.circle = function(x, y, r): void {
    this.beginPath();
    this.arc(x, y, r, 0, 2 * Math.PI, false);
    this.closePath();
  };

  CanvasRenderingContext2D.prototype.square = function(x, y, r): void {
    this.beginPath();
    this.rect(x - r, y - r, r * 2, r * 2);
    this.closePath();
  };

  CanvasRenderingContext2D.prototype.triangle = function(x, y, r): void {
    this.beginPath();

    // the change in radius and the offset is here to center the shape
    r *= 1.15;
    y += 0.275 * r;

    const s = r * 2;
    const s2 = s / 2;
    const ir = (Math.sqrt(3) / 6) * s; // radius of inner circle
    const h = Math.sqrt(s * s - s2 * s2); // height

    this.moveTo(x, y - (h - ir));
    this.lineTo(x + s2, y + ir);
    this.lineTo(x - s2, y + ir);
    this.lineTo(x, y - (h - ir));
    this.closePath();
  };

  CanvasRenderingContext2D.prototype.triangleDown = function(x, y, r): void {
    this.beginPath();

    // the change in radius and the offset is here to center the shape
    r *= 1.15;
    y -= 0.275 * r;

    const s = r * 2;
    const s2 = s / 2;
    const ir = (Math.sqrt(3) / 6) * s; // radius of inner circle
    const h = Math.sqrt(s * s - s2 * s2); // height

    this.moveTo(x, y + (h - ir));
    this.lineTo(x + s2, y - ir);
    this.lineTo(x - s2, y - ir);
    this.lineTo(x, y + (h - ir));
    this.closePath();
  };

  CanvasRenderingContext2D.prototype.star = function(x, y, r): void {
    // http://www.html5canvastutorials.com/labs/html5-canvas-star-spinner/
    this.beginPath();

    // the change in radius and the offset is here to center the shape
    r *= 0.82;
    y += 0.1 * r;

    for (let n = 0; n < 10; n++) {
      const radius = n % 2 === 0 ? r * 1.3 : r * 0.5;
      this.lineTo(
        x + radius * Math.sin((n * 2 * Math.PI) / 10),
        y - radius * Math.cos((n * 2 * Math.PI) / 10)
      );
    }

    this.closePath();
  };

  CanvasRenderingContext2D.prototype.diamond = function(x, y, r): void {
    this.beginPath();

    this.lineTo(x, y + r);
    this.lineTo(x + r, y);
    this.lineTo(x, y - r);
    this.lineTo(x - r, y);

    this.closePath();
  };

  CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, r): void {
    const r2d = Math.PI / 180;
    if (w - 2 * r < 0) {
      r = w / 2;
    } //ensure that the radius isn't too large for x
    if (h - 2 * r < 0) {
      r = h / 2;
    } //ensure that the radius isn't too large for y
    this.beginPath();
    this.moveTo(x + r, y);
    this.lineTo(x + w - r, y);
    this.arc(x + w - r, y + r, r, r2d * 270, r2d * 360, false);
    this.lineTo(x + w, y + h - r);
    this.arc(x + w - r, y + h - r, r, 0, r2d * 90, false);
    this.lineTo(x + r, y + h);
    this.arc(x + r, y + h - r, r, r2d * 90, r2d * 180, false);
    this.lineTo(x, y + r);
    this.arc(x + r, y + r, r, r2d * 180, r2d * 270, false);
    this.closePath();
  };

  CanvasRenderingContext2D.prototype.ellipse_vis = function(x, y, w, h): void {
    const kappa = 0.5522848,
      ox = (w / 2) * kappa, // control point offset horizontal
      oy = (h / 2) * kappa, // control point offset vertical
      xe = x + w, // x-end
      ye = y + h, // y-end
      xm = x + w / 2, // x-middle
      ym = y + h / 2; // y-middle

    this.beginPath();
    this.moveTo(x, ym);
    this.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
    this.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
    this.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
    this.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);
    this.closePath();
  };

  CanvasRenderingContext2D.prototype.database = function(x, y, w, h): void {
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

    this.beginPath();
    this.moveTo(xe, ym);

    this.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
    this.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);

    this.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
    this.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);

    this.lineTo(xe, ymb);

    this.bezierCurveTo(xe, ymb + oy, xm + ox, yeb, xm, yeb);
    this.bezierCurveTo(xm - ox, yeb, x, ymb + oy, x, ymb);

    this.lineTo(x, ym);
  };

  CanvasRenderingContext2D.prototype.dashedLine = function(
    x,
    y,
    x2,
    y2,
    pattern
  ): void {
    this.beginPath();
    this.moveTo(x, y);

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
        this.lineTo(x, y);
      } else {
        this.moveTo(x, y);
      }

      distRemaining -= dashLength;
      draw = !draw;
    }
  };

  CanvasRenderingContext2D.prototype.hexagon = function(x, y, r): void {
    this.beginPath();
    const sides = 6;
    const a = (Math.PI * 2) / sides;
    this.moveTo(x + r, y);
    for (let i = 1; i < sides; i++) {
      this.lineTo(x + r * Math.cos(a * i), y + r * Math.sin(a * i));
    }
    this.closePath();
  };
}
