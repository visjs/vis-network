import { Point } from "./types";

declare global {
  // eslint-disable-next-line no-redeclare
  namespace Cypress {
    interface Chainable<Subject> {
      /**
       * Click point.
       *
       * @param a - DOM x, y coords.
       */
      visClickPoint(a: Point): Chainable<Subject>;
    }
  }
}

// eslint-disable-next-line require-jsdoc
export function visClickPoint(a: Point): void {
  cy.get("#mynetwork canvas").click(a.x, a.y);
}
Cypress.Commands.add("visClickPoint", visClickPoint);
