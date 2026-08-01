import { defineConfig } from "oxfmt";
import type { OxfmtConfig } from "oxfmt";
import sharedOxfmtConfig from "vis-dev-utils/oxfmt-shared-config";

import { ignorePatterns } from "./linting-and-formatting-ignore-patterns.ts";

export default defineConfig<OxfmtConfig>({
  ...sharedOxfmtConfig,
  ignorePatterns,
});
