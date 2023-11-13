// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************
import getCompareSnapshotsPlugin from "cypress-visual-regression/dist/plugin";

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

export default (on, config) => {
  // `on` is used to hook into various events Cypress emits
  // `config` is the resolved Cypress config

  config.specPattern = [];

  const all = !config.env.VISUAL && !config.env.FUNCTIONAL;

  if (all || config.env.VISUAL) {
    // Visual regression screenshot tests.
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

    getCompareSnapshotsPlugin(on, config);
  }

  if (all || config.env.FUNCTIONAL) {
    // Functional tests.
    config.specPattern.push("cypress/e2e/functional/**/*.spec.ts");
  }

  return config;
};
