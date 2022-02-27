declare type IdType = string | number;
export interface ViewFitOptions {
    nodes: IdType[];
    minZoomLevel: number;
    maxZoomLevel: number;
}
/**
 * Validate the fit options, replace missing optional values by defaults etc.
 *
 * @param rawOptions - The raw options.
 * @param allNodeIds - All node ids that will be used if nodes are omitted in
 * the raw options.
 * @returns Options with everything filled in and validated.
 */
export declare function normalizeFitOptions(rawOptions: Partial<ViewFitOptions>, allNodeIds: IdType[]): ViewFitOptions;
export {};
//# sourceMappingURL=index.d.ts.map