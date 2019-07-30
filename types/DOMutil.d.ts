/**
 * this prepares the JSON container for allocating SVG elements
 * @param {Object} JSONcontainer
 * @private
 */
export function prepareElements(JSONcontainer: any): void

/**
 * this cleans up all the unused SVG elements. By asking for the parentNode, we only need to supply the JSON container from
 * which to remove the redundant elements.
 *
 * @param {Object} JSONcontainer
 * @private
 */
export function cleanupElements(JSONcontainer: any): void

/**
 * Ensures that all elements are removed first up so they can be recreated cleanly
 * @param {Object} JSONcontainer
 */
export function resetElements(JSONcontainer: any): void

/**
 * Allocate or generate an SVG element if needed. Store a reference to it in the JSON container and draw it in the svgContainer
 * the JSON container and the SVG container have to be supplied so other svg containers (like the legend) can use this.
 *
 * @param {string} elementType
 * @param {Object} JSONcontainer
 * @param {Object} svgContainer
 * @returns {Element}
 * @private
 */
export function getSVGElement(
  elementType: any,
  JSONcontainer: any,
  svgContainer: any
): any

/**
 * Allocate or generate an SVG element if needed. Store a reference to it in the JSON container and draw it in the svgContainer
 * the JSON container and the SVG container have to be supplied so other svg containers (like the legend) can use this.
 *
 * @param {string} elementType
 * @param {Object} JSONcontainer
 * @param {Element} DOMContainer
 * @param {Element} insertBefore
 * @returns {*}
 */
export function getDOMElement(
  elementType: any,
  JSONcontainer: any,
  DOMContainer: any,
  insertBefore: any
): any

/**
 * Draw a point object. This is a separate function because it can also be called by the legend.
 * The reason the JSONcontainer and the target SVG svgContainer have to be supplied is so the legend can use these functions
 * as well.
 *
 * @param {number} x
 * @param {number} y
 * @param {Object} groupTemplate: A template containing the necessary information to draw the datapoint e.g., {style: 'circle', size: 5, className: 'className' }
 * @param {Object} JSONcontainer
 * @param {Object} svgContainer
 * @param {Object} labelObj
 * @returns {vis.PointItem}
 */
export function drawPoint(
  x: any,
  y: any,
  groupTemplate: any,
  JSONcontainer: any,
  svgContainer: any,
  labelObj: any
): any

/**
 * draw a bar SVG element centered on the X coordinate
 *
 * @param {number} x
 * @param {number} y
 * @param {number} width
 * @param {number} height
 * @param {string} className
 * @param {Object} JSONcontainer
 * @param {Object} svgContainer
 * @param {string} style
 */
export function drawBar(
  x: any,
  y: any,
  width: any,
  height: any,
  className: any,
  JSONcontainer: any,
  svgContainer: any,
  style: any
): void
