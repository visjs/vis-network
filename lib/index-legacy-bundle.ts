// Each part as it's own named export.
export * from "./index-legacy.js";

// All combined into a single object as default export.
import * as vis from "./index-legacy.js";
export { vis as default };
