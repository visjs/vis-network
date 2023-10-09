context("Pollution", { testIsolation: false }, (): void => {
  const resultContainerIds = [
    "results-before-loading",
    "results-after-loading",
    "results-after-rendering",
  ] as const;

  it("Visit", (): void => {
    cy.visit("http://localhost:58253/cypress/pages/pollution.html");

    for (const result of resultContainerIds) {
      cy.get(`#${result}.done`, { timeout: 30000 });
    }
  });

  describe("Check the results", (): void => {
    for (const resultContainerId of resultContainerIds) {
      describe(
        (
          resultContainerId.slice(0, 1).toUpperCase() +
          resultContainerId.slice(1)
        ).replace(/-/g, " "),
        (): void => {
          ["added", "changed", "missing"].forEach((type): void => {
            it(type.slice(0, 1).toUpperCase() + type.slice(1), () => {
              cy.get(`#${resultContainerId}.done .${type} .value`).should(
                "have.text",
                "0"
              );
            });
          });
        }
      );
    }
  });
});
