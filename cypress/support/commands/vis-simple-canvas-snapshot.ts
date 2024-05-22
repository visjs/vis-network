import { UniversalNetworkConfig } from "./types";
import { VisSnapshotOpenedPageOptions } from "./vis-snapshot-opened-page";

declare global {
  namespace Cypress {
    interface Chainable<Subject> {
      /**
       * Open universal page with given configuration and take a screenshot of
       * the canvas.
       *
       * @param label - Snapshot file label. Numbers will be padded by zeros.
       * @param config - Passed to cy.visVisitUniversal.
       * @param options - Passed to cy.visVisitUniversal and
       * cy.visSnapshotOpenedPage.
       */
      visSimpleCanvasSnapshot(
        label: number | string,
        config?: UniversalNetworkConfig,
        options?: VisSnapshotOpenedPageOptions
      ): Chainable<Subject>;
    }
  }
}

export function visSimpleCanvasSnapshot(
  label: number | string,
  config: UniversalNetworkConfig = {},
  options: VisSnapshotOpenedPageOptions = {}
): void {
  cy.visVisitUniversal(config, options);
  cy.visSnapshotOpenedPage(label, options);
}
Cypress.Commands.add("visSimpleCanvasSnapshot", visSimpleCanvasSnapshot);
