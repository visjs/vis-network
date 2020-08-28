import { MoveToOptions } from "./types";
import { deepObjectAssign } from "vis-util";
import { VisVisitPageOptions } from "./vis-visit-universal";

declare global {
  // eslint-disable-next-line no-redeclare
  namespace Cypress {
    interface Chainable<Subject> {
      /**
       * Take a screenshot of the canvas of opened page.
       *
       * @param label - Snapshot file label. Numbers will be padded by zeros.
       * @param options - Passed to cy.visVisitUniversal.
       */
      visSnapshotOpenedPage(
        label: number | string,
        options?: VisSnapshotOpenedPageOptions
      ): Chainable<Subject>;
    }
  }
}

export interface VisSnapshotOpenedPageOptions extends VisVisitPageOptions {
  moveTo?: {
    position?: { x?: number; y?: number };
    scale?: number;
  };
}

// eslint-disable-next-line require-jsdoc
export function visSnapshotOpenedPage(
  label: number | string,
  options: VisSnapshotOpenedPageOptions = {}
): void {
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
Cypress.Commands.add("visSnapshotOpenedPage", visSnapshotOpenedPage);
