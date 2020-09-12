import { VisGlobals } from "./types";

export interface VisRunWithWindowOptions {
  /**
   * How long to wait for the code to finish.
   */
  timeout?: number;
}
export const VIS_DEFAULT_RUN_WITH_WINDOW_TIMEOUT = 4000;

declare global {
  namespace Cypress {
    interface Chainable<Subject> {
      /**
       * Runs custom code with the window object available.
       *
       * @param callback - The callback that will be executed within
       * `cy.window().then` environment.
       * @param options - Additional options.
       */
      visRunWithWindow<S>(
        callback: (props: any) => void,
        options?: VisRunWithWindowOptions
      ): Chainable<S>;
    }
  }
}

export function visRunWithWindow(
  callback: (props: VisGlobals) => void,
  {
    timeout = VIS_DEFAULT_RUN_WITH_WINDOW_TIMEOUT,
  }: VisRunWithWindowOptions = {}
): void {
  cy.window().then({ timeout }, (window: any): void => {
    callback(window);
  });
}
Cypress.Commands.add("visRunWithWindow", visRunWithWindow);
