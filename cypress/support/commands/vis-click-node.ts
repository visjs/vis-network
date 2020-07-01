import { IdType } from "./types";

declare global {
  // eslint-disable-next-line no-redeclare
  namespace Cypress {
    interface Chainable<Subject> {
      /**
       * Click a node based on given node id.
       * Fails if the node doesn't end up in the selection.
       *
       * @param id - Id of the node to be clicked.
       */
      visClickNode<S>(id: IdType): Chainable<S>;
    }
  }
}

// eslint-disable-next-line require-jsdoc
export function visClickNode(id: IdType): void {
  cy.visRun(({ network }): void => {
    const { x, y } = network.canvasToDOM(network.getPositions([id])[id]);
    cy.get("#mynetwork canvas").click(x, y);
    cy.visRun(({ network }): void => {
      try {
        expect(
          network.getSelectedNodes(),
          "The node should be selected after it was clicked."
        ).to.deep.equal([id]);
      } catch (error) {
        cy.pause();
        throw error;
      }
    });
  });
}
Cypress.Commands.add("visClickNode", visClickNode);
