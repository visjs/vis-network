import { UniversalNetworkConfig, MoveToOptions } from "./types";
import { deepObjectAssign } from "vis-util";
import { VisVisitPageOptions } from "./vis-visit-universal";

declare global {
  // eslint-disable-next-line no-redeclare
  namespace Cypress {
    interface Chainable<Subject> {
      /**
       * Open universal page with given configuration and take a screenshot of
       * the canvas.
       *
       * @param label - Snapshot file label. Numbers will be padded by zeros.
       * @param config - Passed to cy.visVisitUniversal.
       * @param options - Passed to cy.visVisitUniversal.
       */
      visSimpleCanvasSnapshot(
        label: number | string,
        config?: UniversalNetworkConfig,
        options?: VisSimpleCanvasSnapshotOptions
      ): Chainable<Subject>;
    }
  }
}

export interface VisSimpleCanvasSnapshotOptions extends VisVisitPageOptions {
  moveTo?: {
    position?: { x?: number; y?: number };
    scale?: number;
  };
}

// eslint-disable-next-line require-jsdoc
export function visSimpleCanvasSnapshot(
  label: number | string,
  config: UniversalNetworkConfig = {},
  options: VisSimpleCanvasSnapshotOptions = {}
): void {
  cy.visVisitUniversal(config, options);
  cy.visRun(({ network }): void => {
    network.moveTo(
      deepObjectAssign<MoveToOptions>(
        {
          position: { x: 0, y: 0 },
          scale: 1,
        },
        options.moveTo ?? {}
      )
    );
  });
  cy.get("#mynetwork canvas").compareSnapshot(
    typeof label === "string" ? label : ("" + label).padStart(3, "0")
  );
}
Cypress.Commands.add("visSimpleCanvasSnapshot", visSimpleCanvasSnapshot);
