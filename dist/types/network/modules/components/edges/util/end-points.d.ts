/** ============================================================================
 * Location of all the endpoint drawing routines.
 *
 * Every endpoint has its own drawing routine, which contains an endpoint definition.
 *
 * The endpoint definitions must have the following properies:
 *
 * - (0,0) is the connection point to the node it attaches to
 * - The endpoints are orientated to the positive x-direction
 * - The length of the endpoint is at most 1
 *
 * As long as the endpoint classes remain simple and not too numerous, they will
 * be contained within this module.
 * All classes here except `EndPoints` should be considered as private to this module.
 *
 * -----------------------------------------------------------------------------
 * ### Further Actions
 *
 * After adding a new endpoint here, you also need to do the following things:
 *
 * - Add the new endpoint name to `network/options.js` in array `endPoints`.
 * - Add the new endpoint name to the documentation.
 *   Scan for 'arrows.to.type` and add it to the description.
 * - Add the endpoint to the examples. At the very least, add it to example
 *   `edgeStyles/arrowTypes`.
 * ============================================================================= */
import { ArrowData } from "./types";
/**
 * Drawing methods for the endpoints.
 */
export declare class EndPoints {
    /**
     * Draw an endpoint.
     *
     * @param ctx - The shape will be rendered into this context.
     * @param arrowData - The data determining the shape.
     *
     * @returns True if ctx.fill() can be used to fill the arrow, false otherwise.
     */
    static draw(ctx: CanvasRenderingContext2D, arrowData: ArrowData): boolean;
}
//# sourceMappingURL=end-points.d.ts.map