import {
  DataSetEdges,
  DataSetNodes,
  Network
} from "../../declarations/entry-standalone";

interface RunCodeProps {
  edges: DataSetEdges;
  network: Network;
  nodes: DataSetNodes;
}

declare global {
  interface Point {
    x: number;
    y: number;
  }

  // eslint-disable-next-line no-redeclare
  namespace Cypress {
    interface Chainable<Subject> {
      /**
       * Runs custom code with the network instance and data sets available.
       *
       * @param callback - The callback that will be executed within
       * `cy.window().then` environment.
       */
      visRunCode<S>(callback: (props: RunCodeProps) => void): Chainable<S>;

      /**
       * Runs custom code with the network instance and data sets available
       * after it has been stabilized and fitted.
       *
       * @param callback - The callback that will be executed within
       * `cy.window().then` environment.
       */
      visStabilizeFitAndRunCode<S>(
        callback: (props: RunCodeProps) => void
      ): Chainable<S>;
    }
  }
}

// eslint-disable-next-line require-jsdoc
export function visRunCode(callback: (props: RunCodeProps) => void): void {
  cy.window().then(({ edges, network, nodes }: any): void => {
    if (edges && network && nodes) {
      callback({ edges, network, nodes });
    } else {
      throw new Error("No page globals were found.");
    }
  });
}
Cypress.Commands.add("visRunCode", visRunCode);

// eslint-disable-next-line require-jsdoc
export function visStabilizeFitAndRunCode(
  callback: (props: RunCodeProps) => void
): void {
  cy.window().then(
    {
      // Stabilization can take really long time depenging on the CPU power
      // available and the amount of nodes and edges used.
      timeout: 30000
    },
    async ({ edges, network, nodes }: any): Promise<void> => {
      if (edges && network && nodes) {
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
              duration: 1000,
              easingFunction: "linear"
            }
          });
        });

        callback({ edges, network, nodes });
      } else {
        throw new Error("No page globals were found.");
      }
    }
  );
}
Cypress.Commands.add("visStabilizeFitAndRunCode", visStabilizeFitAndRunCode);
