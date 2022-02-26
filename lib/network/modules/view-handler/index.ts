type IdType = string | number;

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
export function normalizeFitOptions(
  rawOptions: Partial<ViewFitOptions>,
  allNodeIds: IdType[]
): ViewFitOptions {
  const options = Object.assign<ViewFitOptions, Partial<ViewFitOptions>>(
    {
      nodes: allNodeIds,
      minZoomLevel: Number.MIN_VALUE,
      maxZoomLevel: 1,
    },
    rawOptions ?? {}
  );

  if (!Array.isArray(options.nodes)) {
    throw new TypeError("Nodes has to be an array of ids.");
  }
  if (options.nodes.length === 0) {
    options.nodes = allNodeIds;
  }

  if (!(typeof options.minZoomLevel === "number" && options.minZoomLevel > 0)) {
    throw new TypeError("Min zoom level has to be a number higher than zero.");
  }

  if (
    !(
      typeof options.maxZoomLevel === "number" &&
      options.minZoomLevel <= options.maxZoomLevel
    )
  ) {
    throw new TypeError(
      "Max zoom level has to be a number higher than min zoom level."
    );
  }

  return options;
}
