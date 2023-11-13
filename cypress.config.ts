import { defineConfig } from "cypress";

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
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    async setupNodeEvents(on, config) {
      return (await import("./cypress/plugins/index.ts")).default(on, config);
    },
    specPattern: [
      "cypress/e2e/visual/**/*.spec.ts",
      "cypress/e2e/functional/**/*.spec.ts",
    ],
    supportFile: "cypress/support/e2e.ts",
  },
});
