// Each part as it's own named export.
export * from "./index-legacy";

// All combined into a single object as default export.
import * as vis from "./index-legacy";
export { vis as default };
