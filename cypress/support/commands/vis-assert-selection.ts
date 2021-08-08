import { IdType } from "./types";

declare global {
  namespace Cypress {
    interface Chainable<Subject> {
      /**
       * Check selected nodes and edges.
       *
       * @param selection - The same format as in Network.getSelection().
       */
      visAssertSelection(selection: {
        nodes: IdType[];
        edges: IdType[];
      }): Chainable<Subject>;
    }
  }
}

function sortSelection(selection: { nodes: IdType[]; edges: IdType[] }): {
  nodes: IdType[];
  edges: IdType[];
} {
  return {
    nodes: [...selection.nodes].sort(),
    edges: [...selection.edges].sort(),
  };
}

export function visAssertSelection(expectedSelection: {
  nodes: IdType[];
  edges: IdType[];
}): void {
  cy.get("#selection-json").should(
    "have.text",
    JSON.stringify(sortSelection(expectedSelection))
  );
}
Cypress.Commands.add("visAssertSelection", visAssertSelection);
