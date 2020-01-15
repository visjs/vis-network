context("Pollution", () => {
  it("Visit", () => {
    cy.visit("http://localhost:58253/cypress/pages/pollution.html");

    // This shouldn't be necessary but whithout it the tests fail.
    cy.wait(20000);
  });

  describe("Check the results", () => {
    [
      "results-before-loading",
      "results-after-loading",
      "results-after-rendering"
    ].forEach(id => {
      describe(
        (id.slice(0, 1).toUpperCase() + id.slice(1)).replace("-", " "),
        () => {
          ["added", "changed", "missing"].forEach(type => {
            it(type.slice(0, 1).toUpperCase() + type.slice(1), () => {
              cy.get(`#${id} .${type} .value`, {
                timeout: 10000
              }).should("have.text", "0");
            });
          });
        }
      );
    });
  });
});
