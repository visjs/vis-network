import { IdType } from "./types";

declare global {
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
    }
  }
}

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
  cy.visRun(({ nodes, edges }) => {
    for (const id of nodes.getIds()) {
      oldNodeIds.add(id);
    }
    for (const id of edges.getIds()) {
      oldEdgeIds.add(id);
    }

    between();

    cy.visRun(({ nodes, edges }) => {
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
        removedNodeIds,
      });
    });
  });
}
Cypress.Commands.add("visCheckIds", visCheckIds);
