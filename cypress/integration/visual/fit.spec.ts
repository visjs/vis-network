context("Fit", (): void => {
  beforeEach((): void => {
    cy.visVisitUniversal(
      {
        nodes: [
          { id: 1, label: "Node 1" },
          { id: 2, label: "Node 2" },
          { id: 3, label: "Node 3" },
          { id: 4, label: "Node 4" },
          { id: 5, label: "Node 5" },
        ],
        edges: [
          { from: 1, to: 3 },
          { from: 1, to: 2 },
          { from: 2, to: 4 },
          { from: 2, to: 5 },
          { from: 3, to: 3 },
        ],
      },
      { requireNewerVersionThan: "8.4.2" }
    );
  });

  it("No params", (): void => {
    cy.visRun(({ network }): void => {
      network.fit();
    });
    cy.visSnapshotOpenedPage("no-params", { moveTo: false });
  });

  it("High max", (): void => {
    cy.visRun(({ network }): void => {
      network.fit({
        maxZoomLevel: 20,
      });
    });
    cy.visSnapshotOpenedPage("high-max", { moveTo: false });
  });

  it("Low max", (): void => {
    cy.visRun(({ network }): void => {
      network.fit({
        maxZoomLevel: 0.2,
      });
    });
    cy.visSnapshotOpenedPage("low-max", { moveTo: false });
  });

  it("Impossible to fit min and max", (): void => {
    cy.visRun(({ network }): void => {
      network.fit({
        minZoomLevel: 5,
        maxZoomLevel: 10,
      });
    });
    cy.visSnapshotOpenedPage("impossible-to-fit-min-and-max", {
      moveTo: false,
    });
  });

  it("One node", (): void => {
    cy.visRun(({ network }): void => {
      network.fit({ nodes: [3] });
    });
    cy.visSnapshotOpenedPage("one-node", { moveTo: false });
  });

  it("One node with custom limits", (): void => {
    cy.visRun(({ network }): void => {
      network.fit({
        nodes: [3],
        minZoomLevel: 6,
        maxZoomLevel: 15,
      });
    });
    cy.visSnapshotOpenedPage("one-node-with-custom-limits", { moveTo: false });
  });
});
