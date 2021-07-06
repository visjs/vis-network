import { Point } from "./types";

declare global {
  namespace Cypress {
    interface Chainable<Subject> {
      /**
       * Click between two points.
       *
       * @param a - DOM x, y coords.
       * @param b - DOM x, y coords.
       */
      visClickBetweenPoints(a: Point, b: Point): Chainable<Subject>;
    }
  }
}

export function visClickBetweenPoints(a: Point, b: Point): void {
  const middle = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };

  cy.get("#mynetwork canvas").click(middle.x, middle.y);
}
Cypress.Commands.add("visClickBetweenPoints", visClickBetweenPoints);
