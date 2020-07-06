import { UniversalNetworkConfig } from "./types";
import { VisVisitPageOptions } from "./vis-visit-universal";

declare global {
  // eslint-disable-next-line no-redeclare
  namespace Cypress {
    interface Chainable<Subject> {
      /**
       * Open universal page with given configuration and take a screenshot of
       * the canvas.
       *
       * @param label - Snapshot file label.
       * @param config - Passed to cy.visVisitUniversal.
       * @param options - Passed to cy.visVisitUniversal.
       */
      visSimpleCanvasSnapshot(
        label: string,
        config?: UniversalNetworkConfig,
        options?: VisVisitPageOptions
      ): Chainable<Subject>;
    }
  }
}

// eslint-disable-next-line require-jsdoc
export function visSimpleCanvasSnapshot(
  label: string,
  config: UniversalNetworkConfig = {},
  options: VisVisitPageOptions = {}
): void {
  cy.visVisitUniversal(config, options);
  cy.visRun(({ network }): void => {
    network.moveTo({
      position: { x: 0, y: 0 },
      scale: 1
    });
  });
  cy.get("#mynetwork canvas").compareSnapshot(label);
}
Cypress.Commands.add("visSimpleCanvasSnapshot", visSimpleCanvasSnapshot);
