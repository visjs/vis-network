import compareSnapshotCommand from "cypress-visual-regression/dist/command";

declare global {
  namespace Cypress {
    interface CypressVisualRegressionCompareSnapshotOptions
      extends Cypress.Loggable,
        Cypress.Timeoutable,
        Cypress.ScreenshotOptions {
      errorThreshold: number;
    }

    interface Chainable {
      compareSnapshot(
        name: string,
        options?:
          | number
          | Partial<CypressVisualRegressionCompareSnapshotOptions>
      ): Chainable<null>;
    }
  }
}

compareSnapshotCommand();
