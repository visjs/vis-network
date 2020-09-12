import { VisGlobals } from "./types";

export interface VisStabilizeFitAndRunOptions {
  /**
   * How long to wait for stabilization to finish.
   */
  stabilizationTimeout?: number;
  /**
   * How long to wait for the code to finish.
   */
  runTimeout?: number;
}

import { VIS_DEFAULT_RUN_TIMEOUT } from "./vis-run";
import { VIS_DEFAULT_STABILIZE_AND_FIT_TIMEOUT } from "./vis-stabilize-and-fit";

declare global {
  namespace Cypress {
    interface Chainable<Subject> {
      /**
       * Runs custom code with the network instance and data sets available
       * after it has been stabilized and fitted.
       *
       * @param callback - The callback that will be executed within
       * `cy.window().then` environment.
       * @param options - Additional options.
       */
      visStabilizeFitAndRun<S>(
        callback: (props: VisGlobals) => void,
        options?: VisStabilizeFitAndRunOptions
      ): Chainable<S>;
    }
  }
}

export function visStabilizeFitAndRun(
  callback: (props: VisGlobals) => void,
  {
    stabilizationTimeout = VIS_DEFAULT_STABILIZE_AND_FIT_TIMEOUT,
    runTimeout = VIS_DEFAULT_RUN_TIMEOUT,
  }: VisStabilizeFitAndRunOptions = {}
): void {
  cy.visStabilizeAndFit({ timeout: stabilizationTimeout });
  cy.visRun(callback, {
    timeout: runTimeout,
  });
}
Cypress.Commands.add("visStabilizeFitAndRun", visStabilizeFitAndRun);
