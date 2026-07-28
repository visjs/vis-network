import { defineConfig } from "oxfmt";
import type { OxfmtConfig } from "oxfmt";

import { ignorePatterns } from "./linting-and-formatting-ignore-patterns.ts";
import sharedOxfmtConfig from "vis-dev-utils/oxfmt-shared-config";

export default defineConfig<OxfmtConfig>({
  ...sharedOxfmtConfig,
  ignorePatterns,
});
