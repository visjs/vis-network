declare global {
  namespace Cypress {
    interface Chainable<Subject> {
      /**
       * Delete selected node/edge.
       */
      visDeleteSelected(): Chainable<Subject>;
    }
  }
}

export function visDeleteSelected(): void {
  // Delete selected nodes and edges.
  cy.get(".vis-button.vis-delete").click();
}
Cypress.Commands.add("visDeleteSelected", visDeleteSelected);
