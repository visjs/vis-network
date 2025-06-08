import { defineConfig } from "cypress";
import { configureVisualRegression } from "cypress-visual-regression";

export default defineConfig({
  env: {
    SNAPSHOT_BASE_DIRECTORY: "./cypress/snapshots/base",
    SNAPSHOT_DIFF_DIRECTORY: "./cypress/snapshots/diff",
  },
  screenshotsFolder: "./cypress/snapshots/actual",
  trashAssetsBeforeRuns: true,
  viewportHeight: 1600,
  viewportWidth: 1200,
  e2e: {
    setupNodeEvents(on, config) {
      config.specPattern = [];

      const all = !config.env.VISUAL && !config.env.FUNCTIONAL;

      // Visual regression screenshot tests.
      if (all || config.env.VISUAL) {
        config.specPattern.push("cypress/e2e/visual/**/*.spec.ts");
        config.env.failSilently = false;
        config.trashAssetsBeforeRuns = true;

        if (config.env.UPDATE) {
          config.env.type = "base";
          config.screenshotsFolder = "./cypress/snapshots/base";
        } else {
          config.env.type = "actual";
          config.screenshotsFolder = "./cypress/snapshots/actual";
        }

        configureVisualRegression(on);
      }

      // Functional tests.
      if (all || config.env.FUNCTIONAL) {
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
