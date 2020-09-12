import { visCheckIds } from "./vis-check-ids";

declare global {
  namespace Cypress {
    interface Chainable<Subject> {
      /**
       * Place a new node on the canvas.
       *
       * @param x - DOM x coord.
       * @param y - DOM y coord.
       */
      visPlaceNode(x: number, y: number): Chainable<Subject>;
    }
  }
}

export function visPlaceNode(x: number, y: number): void {
  visCheckIds(
    (): void => {},
    (): void => {
      // Enter node adding mode.
      cy.get(".vis-manipulation .vis-button.vis-add").click();

      // Place the node.
      cy.get("#mynetwork").click(x, y);
    },
    ({ addedNodeIds, removedNodeIds }): void => {
      // Check that exactly one new node was added.
      expect(addedNodeIds, "There should be only one new edge.").to.have.length(
        1
      );
      expect(removedNodeIds, "There should no edges removed.").to.have.length(
        0
      );

      const newId = [...addedNodeIds][0];

      // There should be no node selected yet.
      cy.get("#events .click .node." + newId).should("not.exist");

      // Select the node.
      cy.get("#mynetwork").click(x, y);

      // The added node should be selected now.
      cy.get("#events .click .node." + newId).should("have.length", 1);
    }
  );
}
Cypress.Commands.add("visPlaceNode", visPlaceNode);
