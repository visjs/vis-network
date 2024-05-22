import { MoveToOptions } from "./types";
import { deepObjectAssign } from "vis-util";
import { VisVisitPageOptions } from "./vis-visit-universal";

declare global {
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
  moveTo?:
    | false
    | {
        position?: { x?: number; y?: number };
        scale?: number;
      };
}

export function visSnapshotOpenedPage(
  label: number | string,
  options: VisSnapshotOpenedPageOptions = {}
): void {
  const moveTo = options.moveTo;
  if (moveTo !== false) {
    cy.visRun(({ network }): void => {
      network.moveTo(
        deepObjectAssign<MoveToOptions>(
          {
            position: { x: 0, y: 0 },
            scale: 1,
          },
          moveTo ?? {}
        )
      );
    });
  }

  cy.get("#mynetwork canvas").compareSnapshot(
    typeof label === "string" ? label : ("" + label).padStart(3, "0")
  );
}
Cypress.Commands.add("visSnapshotOpenedPage", visSnapshotOpenedPage);
