import { IdType } from "./types";

declare global {
  namespace Cypress {
    interface Chainable<Subject> {
      /**
       * Click an edge based on given edge id.
       * Fails if the edge doesn't end up in the selection.
       *
       * @param id - Id of the edge to be clicked.
       */
      visClickEdge(id: IdType): Chainable<Subject>;
    }
  }
}

export function visClickEdge(id: IdType): void {
  cy.visRun(({ network }): void => {
    const [fromId, toId] = network.getConnectedNodes(id) as [IdType, IdType];

    const { x: x1, y: y1 } = network.canvasToDOM(
      network.getPositions([fromId])[fromId]
    );
    const { x: x2, y: y2 } = network.canvasToDOM(
      network.getPositions([toId])[toId]
    );

    const x = (x1 + x2) / 2;
    const y = (y1 + y2) / 2;

    cy.get("#mynetwork canvas").click(x, y);
    cy.visRun(({ network }): void => {
      expect(
        network.getSelectedEdges(),
        "The edge should be selected after it was clicked."
      ).to.deep.equal([id]);
    });
  });
}
Cypress.Commands.add("visClickEdge", visClickEdge);
