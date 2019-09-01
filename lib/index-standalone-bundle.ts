// Each part as it's own named export.
export * from "./index-standalone";

// All combined into a single object as default export.
import * as vis from "./index-standalone";
export { vis as default };
