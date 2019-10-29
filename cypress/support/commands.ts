declare global {
  interface Point {
    x: number;
    y: number;
  }

  // eslint-disable-next-line no-redeclare
  namespace Cypress {
    interface Chainable {
      /**
       * Place a new node on the canvas.
       *
       * @param x - DOM x coord.
       * @param y - DOM y coord.
       */
      visPlaceNode(x: number, y: number): void;

      /**
       * Connect nodes at given positions with a new edge.
       *
       * @param from - DOM from node coords.
       * @param to - DOM to node coords.
       */
      visConnectNodes(from: Point, to: Point): void;
    }
  }
}

// eslint-disable-next-line require-jsdoc
export function visPlaceNode(x: number, y: number): void {
  // Open manipulation GUI.
  cy.get(".vis-edit-mode .vis-button.vis-edit").click();

  // Enter node adding mode.
  cy.get(".vis-manipulation .vis-button.vis-add").click();

  // Place the node.
  cy.get("#mynetwork").click(x, y);

  // Close manipulation GUI.
  cy.get(".vis-close").click();

  // There should be no node selected yet.
  cy.get("#events .click .node").should("not.exist");

  // Select the node.
  cy.get("#mynetwork").click(x, y);

  // The added node should be selected now.
  cy.get("#events .click .node").should("have.length", 1);
}
Cypress.Commands.add("visPlaceNode", visPlaceNode);

// eslint-disable-next-line require-jsdoc
export function visConnectNodes(from: Point, to: Point): void {
  const middle = { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 };

  // Open manipulation GUI.
  cy.get(".vis-edit-mode .vis-button.vis-edit").click();

  // Enter node adding mode.
  cy.get(".vis-manipulation .vis-button.vis-connect").click();

  // Drag the edge between the nodes.
  cy.get("#mynetwork").trigger("pointerdown", from.x, from.y, {
    button: 0
  });
  cy.get("#mynetwork").trigger("pointermove", middle.x, middle.y, {
    button: 0
  });
  cy.get("#mynetwork").trigger("pointerup", to.x, to.y, {
    button: 0
  });

  // Close manipulation GUI.
  cy.get(".vis-close").click();

  // There should be no edge selected yet.
  cy.get("#events .click .edge").should("not.exist");

  // Select the edge.
  cy.get("#mynetwork").click(middle.x, middle.y);

  // The added node should be selected now.
  cy.get("#events .click .edge").should("have.length", 1);
}
Cypress.Commands.add("visConnectNodes", visConnectNodes);
