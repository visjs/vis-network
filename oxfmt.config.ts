import { defineSharedConfig } from "vis-dev-utils/oxfmt-shared-config";

import { ignorePatterns } from "./linting-and-formatting-ignore-patterns.ts";

export default defineSharedConfig({
  ignorePatterns,
});
