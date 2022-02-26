import { topMost } from "vis-util/esnext";

/**
 * Helper functions for components
 */

/**
 * Determine values to use for (sub)options of 'chosen'.
 *
 * This option is either a boolean or an object whose values should be examined further.
 * The relevant structures are:
 *
 * - chosen: <boolean value>
 * - chosen: { subOption: <boolean or function> }
 *
 * Where subOption is 'node', 'edge' or 'label'.
 *
 * The intention of this method appears to be to set a specific priority to the options;
 * Since most properties are either bridged or merged into the local options objects, there
 * is not much point in handling them separately.
 * TODO: examine if 'most' in previous sentence can be replaced with 'all'. In that case, we
 *       should be able to get rid of this method.
 *
 * @param {string}  subOption  option within object 'chosen' to consider; either 'node', 'edge' or 'label'
 * @param {object}  pile       array of options objects to consider
 * @returns {boolean | Function}  value for passed subOption of 'chosen' to use
 */
export function choosify(subOption, pile) {
  // allowed values for subOption
  const allowed = ["node", "edge", "label"];
  let value = true;

  const chosen = topMost(pile, "chosen");
  if (typeof chosen === "boolean") {
    value = chosen;
  } else if (typeof chosen === "object") {
    if (allowed.indexOf(subOption) === -1) {
      throw new Error(
        "choosify: subOption '" +
          subOption +
          "' should be one of " +
          "'" +
          allowed.join("', '") +
          "'"
      );
    }

    const chosenEdge = topMost(pile, ["chosen", subOption]);
    if (typeof chosenEdge === "boolean" || typeof chosenEdge === "function") {
      value = chosenEdge;
    }
  }

  return value;
}

/**
 * Check if the point falls within the given rectangle.
 *
 * @param {rect} rect
 * @param {point} point
 * @param {rotationPoint} [rotationPoint] if specified, the rotation that applies to the rectangle.
 * @returns {boolean}  true if point within rectangle, false otherwise
 */
export function pointInRect(rect, point, rotationPoint) {
  if (rect.width <= 0 || rect.height <= 0) {
    return false; // early out
  }

  if (rotationPoint !== undefined) {
    // Rotate the point the same amount as the rectangle
    const tmp = {
      x: point.x - rotationPoint.x,
      y: point.y - rotationPoint.y,
    };

    if (rotationPoint.angle !== 0) {
      // In order to get the coordinates the same, you need to
      // rotate in the reverse direction
      const angle = -rotationPoint.angle;

      const tmp2 = {
        x: Math.cos(angle) * tmp.x - Math.sin(angle) * tmp.y,
        y: Math.sin(angle) * tmp.x + Math.cos(angle) * tmp.y,
      };
      point = tmp2;
    } else {
      point = tmp;
    }

    // Note that if a rotation is specified, the rectangle coordinates
    // are **not* the full canvas coordinates. They are relative to the
    // rotationPoint. Hence, the point coordinates need not be translated
    // back in this case.
  }

  const right = rect.x + rect.width;
  const bottom = rect.y + rect.width;

  return (
    rect.left < point.x &&
    right > point.x &&
    rect.top < point.y &&
    bottom > point.y
  );
}

/**
 * Check if given value is acceptable as a label text.
 *
 * @param {*} text value to check; can be anything at this point
 * @returns {boolean} true if valid label value, false otherwise
 */
export function isValidLabel(text) {
  // Note that this is quite strict: types that *might* be converted to string are disallowed
  return typeof text === "string" && text !== "";
}

/**
 * Returns x, y of self reference circle based on provided angle
 *
 * @param {object} ctx
 * @param {number} angle
 * @param {number} radius
 * @param {VisNode} node
 * @returns {object} x and y coordinates
 */
export function getSelfRefCoordinates(ctx, angle, radius, node) {
  let x = node.x;
  let y = node.y;

  if (typeof node.distanceToBorder === "function") {
    //calculating opposite and adjacent
    //distaneToBorder becomes Hypotenuse.
    //Formulas sin(a) = Opposite / Hypotenuse and cos(a) = Adjacent / Hypotenuse
    const toBorderDist = node.distanceToBorder(ctx, angle);
    const yFromNodeCenter = Math.sin(angle) * toBorderDist;
    const xFromNodeCenter = Math.cos(angle) * toBorderDist;
    //xFromNodeCenter is basically x and if xFromNodeCenter equals to the distance to border then it means
    //that y does not need calculation because it is equal node.height / 2 or node.y
    //same thing with yFromNodeCenter and if yFromNodeCenter equals to the distance to border then it means
    //that x is equal node.width / 2 or node.x
    if (xFromNodeCenter === toBorderDist) {
      x += toBorderDist;
      y = node.y;
    } else if (yFromNodeCenter === toBorderDist) {
      x = node.x;
      y -= toBorderDist;
    } else {
      x += xFromNodeCenter;
      y -= yFromNodeCenter;
    }
  } else if (node.shape.width > node.shape.height) {
    x = node.x + node.shape.width * 0.5;
    y = node.y - radius;
  } else {
    x = node.x + radius;
    y = node.y - node.shape.height * 0.5;
  }

  return { x, y };
}
