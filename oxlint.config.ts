import { defineConfig } from "oxlint";
import type { OxlintConfig } from "oxlint";
import oxlintSharedConfig from "vis-dev-utils/oxlint-shared-config";

import { ignorePatterns } from "./linting-and-formatting-ignore-patterns.ts";

export default defineConfig<OxlintConfig>({
  extends: [oxlintSharedConfig],
  rules: {
    // Enabled by the categories but disabled for now, PRs welcome (even if only partial)
    "eslint/no-shadow": "off",
    "eslint/no-underscore-dangle": "off", // We'll eventually migrate to # (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_elements)
    "eslint/no-useless-concat": "off",
    "oxc/no-this-in-exported-function": "off", // Convert to class syntax
    "typescript/no-extraneous-class": "off",
    "unicorn/consistent-function-scoping": "off",
  },
  overrides: [
    {
      files: ["src/**"],
      rules: {
        "import/no-nodejs-modules": "error",
      },
    },
    {
      files: ["cypress/**", "**/*.test.js", "**/*.test.ts"],
      rules: {
        "eslint/no-unused-expressions": "off",
      },
    },
  ],
  ignorePatterns,
});
