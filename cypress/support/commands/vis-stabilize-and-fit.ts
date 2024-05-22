export interface VisStabilizeAndFitOptions {
  /**
   * How long to wait for stabilization to finish.
   */
  timeout?: number;
}
export const VIS_DEFAULT_STABILIZE_AND_FIT_TIMEOUT = 30000;

declare global {
  namespace Cypress {
    interface Chainable<Subject> {
      /**
       * Stabilizes and fits the network.
       *
       * @param options - Additional options.
       */
      visStabilizeAndFit<S>(options?: VisStabilizeAndFitOptions): Chainable<S>;
    }
  }
}

export function visStabilizeAndFit({
  timeout = VIS_DEFAULT_STABILIZE_AND_FIT_TIMEOUT,
}: VisStabilizeAndFitOptions = {}): void {
  cy.visRun(
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
            duration: 100,
            easingFunction: "linear",
          },
        });
      });
    },
    {
      // Stabilization can take really long time depenging on the CPU power
      // available and the amount of nodes and edges used.
      timeout,
    }
  );

  // It seems that waiting for the animation to finish is not enough and ends up
  // in a race condition. This is not a good solution but it makes problems very
  // unlikely.
  // TODO: Find a better solution!
  cy.wait(4000);
}
Cypress.Commands.add("visStabilizeAndFit", visStabilizeAndFit);
