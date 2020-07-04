context("Simple", (): void => {
  beforeEach((): void => {
    cy.visit("http://localhost:58253/cypress/pages/universal.html");
  });

  it("Click the canvas", (): void => {
    const x = 101;
    const y = 102;

    cy.get("#mynetwork").click(x, y);

    cy.get("#events .click .pointer.DOM.x").should("have.text", "" + x);
    cy.get("#events .click .pointer.DOM.y").should("have.text", "" + y);
  });
});
