import { IdType, Network, DataSet } from "../../declarations/entry-standalone";

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
       * Check ids after some actions.
       *
       * @param before -
       * @param between -
       * @param after -
       */
      visCheckIds(
        before: () => void,
        between: () => void,
        after: (results: {
          addedEdgeIds: Set<IdType>;
          addedNodeIds: Set<IdType>;
          newEdgeIds: Set<IdType>;
          newNodeIds: Set<IdType>;
          oldEdgeIds: Set<IdType>;
          oldNodeIds: Set<IdType>;
          removedEdgeIds: Set<IdType>;
          removedNodeIds: Set<IdType>;
        }) => void
      ): Chainable<Subject>;

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
       * Edit selected node/edge.
       */
      visEditSelected(): Chainable<Subject>;

      /**
       * Delete selected node/edge.
       */
      visDeleteSelected(): Chainable<Subject>;

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
       * Click point.
       *
       * @param a - DOM x, y coords.
       */
      visClickPoint(a: Point): Chainable<Subject>;

      /**
       * Click between two points.
       *
       * @param a - DOM x, y coords.
       * @param b - DOM x, y coords.
       */
      visClickBetweenPoints(a: Point, b: Point): Chainable<Subject>;

      /**
       * Stabilizes and fits the network.
       */
      visStabilizeAndFit(): Chainable<Subject>;

      /**
       * Access Vis globals from tested page.
       *
       * @param callback - Function that will receive relevant global variables
       * from the page.
       */
      visGlobals(
        callback: (results: {
          lastEvents: Record<string, any>;
          network: Network;
          nodes: DataSet<any>;
          edges: DataSet<any>;
        }) => void
      ): Chainable<Subject>;
    }
  }
}

// eslint-disable-next-line require-jsdoc
export function visCheckIds(
  before: () => void,
  between: () => void,
  after: (results: {
    addedEdgeIds: Set<IdType>;
    addedNodeIds: Set<IdType>;
    newEdgeIds: Set<IdType>;
    newNodeIds: Set<IdType>;
    oldEdgeIds: Set<IdType>;
    oldNodeIds: Set<IdType>;
    removedEdgeIds: Set<IdType>;
    removedNodeIds: Set<IdType>;
  }) => void
): void {
  before();

  const oldNodeIds = new Set<IdType>();
  const oldEdgeIds = new Set<IdType>();
  cy.visGlobals(({ nodes, edges }) => {
    for (const id of nodes.getIds()) {
      oldNodeIds.add(id);
    }
    for (const id of edges.getIds()) {
      oldEdgeIds.add(id);
    }

    between();

    cy.visGlobals(({ nodes, edges }) => {
      const newNodeIds = new Set<IdType>(nodes.getIds());
      const newEdgeIds = new Set<IdType>(edges.getIds());

      const addedNodeIds = new Set<IdType>(
        [...newNodeIds].filter((id: IdType): boolean => !oldNodeIds.has(id))
      );
      const addedEdgeIds = new Set<IdType>(
        [...newEdgeIds].filter((id: IdType): boolean => !oldEdgeIds.has(id))
      );

      const removedNodeIds = new Set<IdType>(
        [...oldNodeIds].filter((id: IdType): boolean => !newNodeIds.has(id))
      );
      const removedEdgeIds = new Set<IdType>(
        [...oldEdgeIds].filter((id: IdType): boolean => !newEdgeIds.has(id))
      );

      after({
        addedEdgeIds,
        addedNodeIds,
        newEdgeIds,
        newNodeIds,
        oldEdgeIds,
        oldNodeIds,
        removedEdgeIds,
        removedNodeIds
      });
    });
  });
}
Cypress.Commands.add("visCheckIds", visCheckIds);

// eslint-disable-next-line require-jsdoc
export function visPlaceNode(x: number, y: number): void {
  visCheckIds(
    (): void => {},
    (): void => {
      // Open manipulation GUI.
      cy.get(".vis-edit-mode .vis-button.vis-edit-mode").click();

      // Enter node adding mode.
      cy.get(".vis-manipulation .vis-button.vis-add").click();

      // Place the node.
      cy.get("#mynetwork").click(x, y);

      // Close manipulation GUI.
      cy.get(".vis-close").click();
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

// eslint-disable-next-line require-jsdoc
export function visConnectNodes(from: Point, to: Point): void {
  const middle = { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 };

  visCheckIds(
    (): void => {},
    (): void => {
      // Open manipulation GUI.
      cy.get(".vis-edit-mode .vis-button.vis-edit-mode").click();

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

// eslint-disable-next-line require-jsdoc
export function visEditSelected(): void {
  // Open manipulation GUI.
  cy.get(".vis-edit-mode .vis-button.vis-edit-mode").click();

  // Enter edit mode
  cy.get(".vis-manipulation .vis-button.vis-edit").click();

  // Close manipulation GUI.
  cy.get(".vis-close").click();
}
Cypress.Commands.add("visEditSelected", visEditSelected);

// eslint-disable-next-line require-jsdoc
export function visDeleteSelected(): void {
  // Open manipulation GUI.
  cy.get(".vis-edit-mode .vis-button.vis-edit-mode").click();

  // Delete selected nodes and edges.
  cy.get(".vis-button.vis-delete").click();

  // Close manipulation GUI.
  cy.get(".vis-close").click();
}
Cypress.Commands.add("visDeleteSelected", visDeleteSelected);

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
export function visClickPoint(a: Point): void {
  cy.get("#mynetwork canvas").click(a.x, a.y);
}
Cypress.Commands.add("visClickPoint", visClickPoint);

// eslint-disable-next-line require-jsdoc
export function visClickBetweenPoints(a: Point, b: Point): void {
  const middle = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };

  cy.get("#mynetwork canvas").click(middle.x, middle.y);
}
Cypress.Commands.add("visClickBetweenPoints", visClickBetweenPoints);

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

// eslint-disable-next-line require-jsdoc
export function visGlobals(
  callback: (results: {
    lastEvents: Record<string, any>;
    network: Network;
    nodes: DataSet<any>;
    edges: DataSet<any>;
  }) => void
): void {
  cy.window().then((win: any) => {
    callback({
      lastEvents: win.visLastEvents,
      network: win.visNetwork,
      nodes: win.visNodes,
      edges: win.visEdges
    });
  });
}
Cypress.Commands.add("visGlobals", visGlobals);
