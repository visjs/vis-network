declare global {
  // eslint-disable-next-line no-redeclare
  namespace Cypress {
    interface Chainable<Subject> {
      /**
       * Edit selected node/edge.
       */
      visEditSelected(): Chainable<Subject>;
    }
  }
}

// eslint-disable-next-line require-jsdoc
export function visEditSelected(): void {
  // Enter edit mode
  cy.get(".vis-manipulation .vis-button.vis-edit").click();
}
Cypress.Commands.add("visEditSelected", visEditSelected);
