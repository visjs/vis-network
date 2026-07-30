import { defineConfig } from "cypress";
import { configureVisualRegression } from "cypress-visual-regression";

export default defineConfig({
  expose: {
    visNetworkTag: process.env.VIS_NETWORK_TAG ?? null,

    visualRegressionBaseDirectory: "./cypress/snapshots/base",
    visualRegressionDiffDirectory: "./cypress/snapshots/diff",
    visualRegressionGenerateDiff: "always",
    visualRegressionType:
      process.env.E2E_VISUAL_REGRESSION_TYPE ?? "regression",
  },
  allowCypressEnv: false,
  screenshotsFolder: "./cypress/snapshots/actual",
  trashAssetsBeforeRuns: true,
  viewportHeight: 1600,
  viewportWidth: 1200,
  e2e: {
    setupNodeEvents(on, config) {
      config.specPattern = [];

      const all = !process.env.E2E_VISUAL && !process.env.E2E_FUNCTIONAL;

      // Visual regression screenshot tests.
      if (all || process.env.E2E_VISUAL) {
        config.specPattern.push("cypress/e2e/visual/**/*.spec.ts");
        config.trashAssetsBeforeRuns = true;

        configureVisualRegression(on);
      }

      // Functional tests.
      if (all || process.env.E2E_FUNCTIONAL) {
        config.specPattern.push("cypress/e2e/functional/**/*.spec.ts");
      }

      return config;
    },
    specPattern: [
      "cypress/e2e/visual/**/*.spec.ts",
      "cypress/e2e/functional/**/*.spec.ts",
    ],
    supportFile: "cypress/support/e2e.ts",
  },
});
