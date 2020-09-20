/**
 * Associates a canvas to a given image, containing a number of renderings
 * of the image at various sizes.
 *
 * This technique is known as 'mipmapping'.
 *
 * NOTE: Images can also be of type 'data:svg+xml`. This code also works
 *       for svg, but the mipmapping may not be necessary.
 *
 * @param {Image} image
 */
class CachedImage {
  /**
   * @ignore
   */
  constructor() {
    this.NUM_ITERATIONS = 4; // Number of items in the coordinates array

    this.image = new Image();
    this.canvas = document.createElement("canvas");
  }

  /**
   * Called when the image has been successfully loaded.
   */
  init() {
    if (this.initialized()) return;

    this.src = this.image.src; // For same interface with Image
    const w = this.image.width;
    const h = this.image.height;

    // Ease external access
    this.width = w;
    this.height = h;

    const h2 = Math.floor(h / 2);
    const h4 = Math.floor(h / 4);
    const h8 = Math.floor(h / 8);
    const h16 = Math.floor(h / 16);

    const w2 = Math.floor(w / 2);
    const w4 = Math.floor(w / 4);
    const w8 = Math.floor(w / 8);
    const w16 = Math.floor(w / 16);

    // Make canvas as small as possible
    this.canvas.width = 3 * w4;
    this.canvas.height = h2;

    // Coordinates and sizes of images contained in the canvas
    // Values per row:  [top x, left y, width, height]

    this.coordinates = [
      [0, 0, w2, h2],
      [w2, 0, w4, h4],
      [w2, h4, w8, h8],
      [5 * w8, h4, w16, h16],
    ];

    this._fillMipMap();
  }

  /**
   * @returns {boolean} true if init() has been called, false otherwise.
   */
  initialized() {
    return this.coordinates !== undefined;
  }

  /**
   * Redraw main image in various sizes to the context.
   *
   * The rationale behind this is to reduce artefacts due to interpolation
   * at differing zoom levels.
   *
   * Source: http://stackoverflow.com/q/18761404/1223531
   *
   * This methods takes the resizing out of the drawing loop, in order to
   * reduce performance overhead.
   *
   * TODO: The code assumes that a 2D context can always be gotten. This is
   *       not necessarily true! OTOH, if not true then usage of this class
   *       is senseless.
   *
   * @private
   */
  _fillMipMap() {
    const ctx = this.canvas.getContext("2d");

    // First zoom-level comes from the image
    const to = this.coordinates[0];
    ctx.drawImage(this.image, to[0], to[1], to[2], to[3]);

    // The rest are copy actions internal to the canvas/context
    for (let iterations = 1; iterations < this.NUM_ITERATIONS; iterations++) {
      const from = this.coordinates[iterations - 1];
      const to = this.coordinates[iterations];

      ctx.drawImage(
        this.canvas,
        from[0],
        from[1],
        from[2],
        from[3],
        to[0],
        to[1],
        to[2],
        to[3]
      );
    }
  }

  /**
   * Draw the image, using the mipmap if necessary.
   *
   * MipMap is only used if param factor > 2; otherwise, original bitmap
   * is resized. This is also used to skip mipmap usage, e.g. by setting factor = 1
   *
   * Credits to 'Alex de Mulder' for original implementation.
   *
   * @param {CanvasRenderingContext2D} ctx  context on which to draw zoomed image
   * @param {Float} factor scale factor at which to draw
   * @param {number} left
   * @param {number} top
   * @param {number} width
   * @param {number} height
   */
  drawImageAtPosition(ctx, factor, left, top, width, height) {
    if (!this.initialized()) return; //can't draw image yet not intialized

    if (factor > 2) {
      // Determine which zoomed image to use
      factor *= 0.5;
      let iterations = 0;
      while (factor > 2 && iterations < this.NUM_ITERATIONS) {
        factor *= 0.5;
        iterations += 1;
      }

      if (iterations >= this.NUM_ITERATIONS) {
        iterations = this.NUM_ITERATIONS - 1;
      }
      //console.log("iterations: " + iterations);

      const from = this.coordinates[iterations];
      ctx.drawImage(
        this.canvas,
        from[0],
        from[1],
        from[2],
        from[3],
        left,
        top,
        width,
        height
      );
    } else {
      // Draw image directly
      ctx.drawImage(this.image, left, top, width, height);
    }
  }
}

export default CachedImage;
