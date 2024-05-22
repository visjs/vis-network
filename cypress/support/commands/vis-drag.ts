import { DragPath } from "./types";

declare global {
  namespace Cypress {
    interface Chainable<Subject> {
      /**
       * Drag along paths.
       *
       * @param paths - The paths to drag along.
       */
      visDrag(paths: readonly DragPath[]): Chainable<Subject>;
    }
  }
}

export function visDrag(paths: readonly DragPath[]): void {
  for (const { button, from, shiftKey, to } of paths) {
    cy.get("#mynetwork canvas").trigger("pointerdown", from.x, from.y, {
      button,
      shiftKey,
    });
    for (const relativeDistance of new Array(10).fill(null).map(
      (_v, i, array): number =>
        // Note: This shouldn't be 0 nor 1, only values in between.
        (i + 1) / (array.length + 1)
    )) {
      cy.get("#mynetwork canvas").trigger(
        "pointermove",
        from.x + (to.x - from.x) * relativeDistance,
        from.y + (to.y - from.y) * relativeDistance,
        {
          button,
          shiftKey,
        }
      );
    }
    cy.get("#mynetwork canvas").trigger("pointerup", to.x, to.y, {
      button,
      shiftKey,
    });
  }
}
Cypress.Commands.add("visDrag", visDrag);
