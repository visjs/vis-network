import { Point } from "./types";
import { visCheckIds } from "./vis-check-ids";

declare global {
  namespace Cypress {
    interface Chainable<Subject> {
      /**
       * Connect nodes at given positions with a new edge.
       *
       * @param from - DOM from node coords.
       * @param to - DOM to node coords.
       */
      visConnectNodes(from: Point, to: Point): Chainable<Subject>;
    }
  }
}

export function visConnectNodes(from: Point, to: Point): void {
  const middle = { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 };

  visCheckIds(
    (): void => {},
    (): void => {
      // Enter node adding mode.
      cy.get(".vis-manipulation .vis-button.vis-connect").click();

      // Drag the edge between the nodes.
      cy.get("#mynetwork").trigger("pointerdown", from.x, from.y, {
        button: 0,
      });
      cy.get("#mynetwork").trigger("pointermove", middle.x, middle.y, {
        button: 0,
      });
      cy.get("#mynetwork").trigger("pointerup", to.x, to.y, {
        button: 0,
      });
    },
    ({ addedEdgeIds, removedEdgeIds }): void => {
      // Check that exactly one new edge was added.
      expect(addedEdgeIds, "There should be only one new edge.").to.have.length(
        1
      );
      expect(removedEdgeIds, "There should no edges removed.").to.have.length(
        0
      );

      const newId = [...addedEdgeIds][0];

      // There should be no edge selected yet.
      cy.get("#events .click .edge." + newId).should("not.exist");

      // Select the edge.
      cy.get("#mynetwork").click(middle.x, middle.y);

      // The added node should be selected now.
      cy.get("#events .click .edge." + newId).should("have.length", 1);
    }
  );
}
Cypress.Commands.add("visConnectNodes", visConnectNodes);
