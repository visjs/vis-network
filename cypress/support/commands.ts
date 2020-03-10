import { IdType } from "../../declarations/entry-standalone";

export * from "./access-globals";

declare global {
  interface Point {
    x: number;
    y: number;
  }

  // eslint-disable-next-line no-redeclare
  namespace Cypress {
    interface Chainable<Subject> {
      /**
       * Place a new node on the canvas.
       *
       * @param x - DOM x coord.
       * @param y - DOM y coord.
       */
      visPlaceNode(x: number, y: number): Chainable<Subject>;

      /**
       * Connect nodes at given positions with a new edge.
       *
       * @param from - DOM from node coords.
       * @param to - DOM to node coords.
       */
      visConnectNodes(from: Point, to: Point): Chainable<Subject>;

      /**
       * Click a node based on given node id.
       * Fails if the node doesn't end up in the selection.
       *
       * @param id - Id of the node to be clicked.
       */
      visClickNode(id: IdType): Chainable<Subject>;

      /**
       * Click an edge based on given edge id.
       * Fails if the edge doesn't end up in the selection.
       *
       * @param id - Id of the edge to be clicked.
       */
      visClickEdge(id: IdType): Chainable<Subject>;

      /**
       * Stabilizes and fits the network.
       */
      visStabilizeAndFit(): Chainable<Subject>;
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

// eslint-disable-next-line require-jsdoc
export function visClickNode(id: IdType): void {
  cy.visRunCode(({ network }): void => {
    const { x, y } = network.canvasToDOM(network.getPositions([id])[id]);
    cy.get("#mynetwork canvas").click(x, y);
    cy.visRunCode(({ network }): void => {
      expect(
        network.getSelectedNodes(),
        "The node should be selected after it was clicked."
      ).to.deep.equal([id]);
    });
  });
}
Cypress.Commands.add("visClickNode", visClickNode);

// eslint-disable-next-line require-jsdoc
export function visClickEdge(id: IdType): void {
  cy.visRunCode(({ network }): void => {
    const [fromId, toId] = network.getConnectedNodes(id) as IdType[];

    const { x: x1, y: y1 } = network.canvasToDOM(
      network.getPositions([fromId])[fromId]
    );
    const { x: x2, y: y2 } = network.canvasToDOM(
      network.getPositions([toId])[toId]
    );

    const x = (x1 + x2) / 2;
    const y = (y1 + y2) / 2;

    cy.get("#mynetwork canvas").click(x, y);
    cy.visRunCode(({ network }): void => {
      expect(
        network.getSelectedEdges(),
        "The edge should be selected after it was clicked."
      ).to.deep.equal([id]);
    });
  });
}
Cypress.Commands.add("visClickEdge", visClickEdge);

// eslint-disable-next-line require-jsdoc
export function visStabilizeAndFit(): void {
  cy.visRunCode(
    async ({ network }): Promise<void> => {
      /*
       * Wait for the network to stabilize.
       */
      await new Promise((resolve): void => {
        network.once("stabilized", resolve);
        network.stabilize();
      });

      /*
       * Wait for the network to be fitted into the viewport.
       *
       * The purpose of the animation is to fire an event when everything is
       * done. Whithout the animation there is no way of knowing when it's
       * actually done and Cypress will just error out immediately.
       */
      await new Promise((resolve): void => {
        network.once("animationFinished", resolve);
        network.fit({
          animation: {
            duration: 1000,
            easingFunction: "linear"
          }
        });
      });
    }
  );
}
Cypress.Commands.add("visStabilizeAndFit", visStabilizeAndFit);
