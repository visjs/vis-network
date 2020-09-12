import { UniversalConfig, UniversalNetworkConfig } from "./types";
import { compare } from "compare-versions";

declare global {
  namespace Cypress {
    interface Chainable<Subject> {
      /**
       * Open the universal page.
       *
       * @param config - Network nodes, edges, options…
       * @param options - Version constrains.
       */
      visVisitUniversal(
        config?: UniversalNetworkConfig,
        options?: VisVisitPageOptions
      ): Chainable<Subject>;
    }
  }
}

export interface VisVisitPageOptions extends UniversalNetworkConfig {
  requireNewerVersionThan?: null | string;
}

/**
 * Load universal page with given version of Vis Network.
 *
 * @param config - Network nodes, edges, options…
 */
function visitPage(config: UniversalConfig): void {
  expect(
    config.version,
    "The version has to be a valid break.add.fix version or null (current code)."
  ).to.satisfy((version: unknown): boolean => {
    return (
      version === null ||
      (typeof version === "string" && /^\d+\.\d+\.\d+$/.test(version))
    );
  });

  cy.visit(
    "http://localhost:58253/cypress/pages/universal.html#" +
      encodeURIComponent(JSON.stringify(config))
  );
  cy.get("#status").contains("Ready", {
    timeout: Cypress.config("pageLoadTimeout"),
  });
}

export function visVisitUniversal(
  config: UniversalNetworkConfig = {},
  { requireNewerVersionThan }: VisVisitPageOptions = {}
): void {
  const tag = Cypress.env("VIS_NETWORK_TAG") ?? null;

  if (tag == null) {
    // Current code can always be used.
    visitPage({ ...config, version: null });
    return;
  }

  // Check that the requested version is withing the constrains of this test
  // case.
  cy.request("GET", `https://unpkg.com/vis-network@${tag}/package.json`).then(
    (response): void => {
      expect(response.body).to.have.property("version").that.is.a("string");

      const version = response.body.version;

      if (typeof requireNewerVersionThan !== "string") {
        // This test case has no constrains on Vis Network versions.
        visitPage({ ...config, version });
      } else if (compare(requireNewerVersionThan, version, "<")) {
        // The requested version is within the constrains, use it.
        visitPage({ ...config, version });
      } else {
        // The requested version is not within the constrains, use the head of
        // current branch instead.
        visitPage({ ...config, version: null });
      }
    }
  );
}
Cypress.Commands.add("visVisitUniversal", visVisitUniversal);
