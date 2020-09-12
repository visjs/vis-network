import { VisGlobals } from "./types";

export interface VisRunOptions {
  /**
   * How long to wait for the code to finish.
   */
  timeout?: number;
}
export const VIS_DEFAULT_RUN_TIMEOUT = 4000;

declare global {
  // eslint-disable-next-line no-redeclare
  namespace Cypress {
    interface Chainable<Subject> {
      /**
       * Runs custom code with the network instance and data sets available.
       *
       * @param callback - The callback that will be executed within
       * `cy.window().then` environment.
       * @param options - Additional options.
       */
      visRun<S>(
        callback: (props: VisGlobals) => void,
        options?: VisRunOptions
      ): Chainable<S>;
    }
  }
}

// eslint-disable-next-line require-jsdoc
export function visRun(
  callback: (props: VisGlobals) => void,
  { timeout = VIS_DEFAULT_RUN_TIMEOUT }: VisRunOptions = {}
): void {
  cy.window().then(
    { timeout },
    ({
      visEdges: edges,
      visLastEvents: lastEvents,
      visNetwork: network,
      visNodes: nodes,
    }: any): void => {
      if (edges && lastEvents && network && nodes) {
        callback({ edges, lastEvents, network, nodes });
      } else {
        throw new Error("No page globals were found.");
      }
    }
  );
}
Cypress.Commands.add("visRun", visRun);
