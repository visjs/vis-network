context("Simple", () => {
  beforeEach(() => {
    cy.visit("http://localhost:58253/cypress/pages/simple.html");
  });

  it("Click the canvas", () => {
    const x = 101;
    const y = 102;

    cy.get("#mynetwork").click(x, y);

    cy.get("#events .click .pointer.DOM.x").should("have.text", "" + x);
    cy.get("#events .click .pointer.DOM.y").should("have.text", "" + y);
  });
});
