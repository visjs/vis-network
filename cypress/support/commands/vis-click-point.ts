import { Point } from "./types";

declare global {
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

export function visClickPoint(a: Point): void {
  cy.get("#mynetwork canvas").click(a.x, a.y);
}
Cypress.Commands.add("visClickPoint", visClickPoint);
