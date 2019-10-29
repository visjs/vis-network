context("Manipulation GUI", () => {
  beforeEach(() => {
    cy.visit("http://localhost:58253/cypress/pages/simple.html");
  });

  it("Add a node", () => {
    cy.visPlaceNode(101, 102);
  });

  it("Add 2 nodes and 1 edge", () => {
    const a = { x: 101, y: 102 };
    const b = { x: 201, y: 202 };

    cy.visPlaceNode(a.x, a.y);
    cy.visPlaceNode(b.x, b.y);
    cy.visConnectNodes(a, b);
  });
});
