import { VisGlobals, VisWindow } from "./types";

export interface VisRunOptions {
  /**
   * How long to wait for the code to finish.
   */
  timeout?: number;
}
export const VIS_DEFAULT_RUN_TIMEOUT = 4000;

declare global {
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
        callback: (props: VisGlobals) => void | Promise<void>,
        options?: VisRunOptions
      ): Chainable<S>;
    }
  }
}

export function visRun(
  callback: (props: VisGlobals) => void | Promise<void>,
  { timeout = VIS_DEFAULT_RUN_TIMEOUT }: VisRunOptions = {}
): void {
  cy.window().then({ timeout }, async (win: any): Promise<void> => {
    const {
      visEdges: edges,
      visEventQueue: eventQueue,
      visLastEvents: lastEvents,
      visNetwork: network,
      visNodes: nodes,
    }: VisWindow = win;

    if (edges && lastEvents && network && nodes) {
      await callback({ edges, eventQueue, lastEvents, network, nodes });
    } else {
      throw new Error("No page globals were found.");
    }
  });
}
Cypress.Commands.add("visRun", visRun);
