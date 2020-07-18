import compareSnapshotCommand from "cypress-visual-regression/dist/command";

declare global {
  // eslint-disable-next-line no-redeclare
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
