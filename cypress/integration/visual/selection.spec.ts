context("Selection", (): void => {
  beforeEach((): void => {
    cy.visVisitUniversal(
      {
        nodes: [
          { id: "N_1", label: "node 1", x: 0, y: 0 },
          { id: "N_2", label: "node 2", x: 200, y: 0 },
          { id: "N_3", label: "node 3", x: 0, y: 200 },
          { id: "N_4", label: "node 4", x: -200, y: 0 },
          { id: "N_5", label: "node 5", x: 0, y: -200 },
        ],
        edges: [
          { id: "E_1-2", label: "edge 1-2", from: "N_1", to: "N_2" },
          { id: "E_1-3", label: "edge 1-3", from: "N_1", to: "N_3" },
          { id: "E_1-4", label: "edge 1-4", from: "N_1", to: "N_4" },
          { id: "E_1-5", label: "edge 1-5", from: "N_1", to: "N_5" },

          { id: "E_2-3", label: "edge 2-3", from: "N_2", to: "N_3" },
          { id: "E_3-4", label: "edge 3-4", from: "N_3", to: "N_4" },
          { id: "E_4-5", label: "edge 4-5", from: "N_4", to: "N_5" },
          { id: "E_5-2", label: "edge 5-2", from: "N_5", to: "N_2" },
        ],
        physics: false,
      },
      { requireNewerVersionThan: "9.0.0" }
    );
  });

  it("Select one by click", function (): void {
    cy.visClickPoint({ x: 500 + 0, y: 500 + 0 });
    cy.visAssertSelection({
      nodes: ["N_1"],
      edges: ["E_1-2", "E_1-3", "E_1-4", "E_1-5"],
    });
    cy.visShiftAndAssertEventFired("select");
    cy.visShiftAndAssertEventFired("selectEdge");
    cy.visShiftAndAssertEventFired("selectNode");
    cy.visShiftAndAssertEventNone(
      "deselectEdge",
      "deselectNode",
      "select",
      "selectEdge",
      "selectNode"
    );

    cy.visClickPoint({ x: 500 + 200, y: 500 + 0 });
    cy.visAssertSelection({
      nodes: ["N_2"],
      edges: ["E_5-2", "E_1-2", "E_2-3"],
    });
    cy.visShiftAndAssertEventFired("deselectEdge");
    cy.visShiftAndAssertEventFired("deselectNode");
    cy.visShiftAndAssertEventFired("select");
    cy.visShiftAndAssertEventFired("selectEdge");
    cy.visShiftAndAssertEventFired("selectNode");
    cy.visShiftAndAssertEventNone(
      "deselectEdge",
      "deselectNode",
      "select",
      "selectEdge",
      "selectNode"
    );

    cy.visSnapshotOpenedPage("select-one-by-click");
  });

  it("Select none by single drag", function (): void {
    cy.visDrag([
      {
        from: { x: 500 + 200 + 70, y: 500 + 200 - 70 },
        to: { x: 500 + 200 - 70, y: 500 + 200 + 70 },
        button: 0,
        shiftKey: true,
      },
    ]);
    cy.visAssertSelection({
      nodes: [],
      edges: [],
    });
    cy.visShiftAndAssertEventNone(
      "deselectEdge",
      "deselectNode",
      "select",
      "selectEdge",
      "selectNode"
    );

    cy.visSnapshotOpenedPage("select-none-by-single-drag");
  });

  it("Select one by single drag (TL to BR)", function (): void {
    cy.visDrag([
      {
        from: { x: 500 + 0 - 70, y: 500 + 0 - 70 },
        to: { x: 500 + 0 + 70, y: 500 + 0 + 70 },
        button: 0,
        shiftKey: true,
      },
    ]);
    cy.visAssertSelection({
      nodes: ["N_1"],
      edges: ["E_1-2", "E_1-3", "E_1-4", "E_1-5"],
    });
    cy.visShiftAndAssertEventFired("select");
    cy.visShiftAndAssertEventFired("selectEdge");
    cy.visShiftAndAssertEventFired("selectNode");
    cy.visShiftAndAssertEventNone(
      "deselectEdge",
      "deselectNode",
      "select",
      "selectEdge",
      "selectNode"
    );

    cy.visSnapshotOpenedPage("select-one-by-single-drag-(TL_to_BR)");
  });

  it("Select three by single drag (BR to TL)", function (): void {
    cy.visDrag([
      {
        from: { x: 500 + 200 + 70, y: 500 + 200 + 70 },
        to: { x: 500 + 0 - 70, y: 500 + 0 - 70 },
        button: 0,
        shiftKey: true,
      },
    ]);
    cy.visAssertSelection({
      nodes: ["N_1", "N_2", "N_3"],
      edges: ["E_1-2", "E_1-3", "E_1-4", "E_1-5", "E_3-4", "E_2-3", "E_5-2"],
    });
    cy.visShiftAndAssertEventFired("select");
    cy.visShiftAndAssertEventFired("selectEdge");
    cy.visShiftAndAssertEventFired("selectNode");
    cy.visShiftAndAssertEventNone(
      "deselectEdge",
      "deselectNode",
      "select",
      "selectEdge",
      "selectNode"
    );

    cy.visSnapshotOpenedPage("select-three-by-single-drag-(BR_to_TL)");
  });

  it("Select three by two drags (TR to BL then BL to TR)", function (): void {
    cy.visDrag([
      {
        from: { x: 500 + 0 + 70, y: 500 + 0 - 70 },
        to: { x: 500 + 0 - 70, y: 500 + 200 + 70 },
        button: 0,
        shiftKey: true,
      },
    ]);
    cy.visAssertSelection({
      nodes: ["N_1", "N_3"],
      edges: ["E_1-2", "E_1-3", "E_1-4", "E_1-5", "E_3-4", "E_2-3"],
    });
    cy.visShiftAndAssertEventFired("select");
    cy.visShiftAndAssertEventFired("selectEdge");
    cy.visShiftAndAssertEventFired("selectNode");
    cy.visShiftAndAssertEventNone(
      "deselectEdge",
      "deselectNode",
      "select",
      "selectEdge",
      "selectNode"
    );

    cy.visDrag([
      {
        from: { x: 500 + 200 - 70, y: 500 + 0 + 70 },
        to: { x: 500 + 200 + 70, y: 500 + 0 - 70 },
        button: 0,
        shiftKey: true,
      },
    ]);
    cy.visAssertSelection({
      nodes: ["N_1", "N_2", "N_3"],
      edges: ["E_1-2", "E_1-3", "E_1-4", "E_1-5", "E_3-4", "E_2-3", "E_5-2"],
    });
    cy.visShiftAndAssertEventFired("select");
    cy.visShiftAndAssertEventFired("selectEdge");
    cy.visShiftAndAssertEventFired("selectNode");
    cy.visShiftAndAssertEventNone(
      "deselectEdge",
      "deselectNode",
      "select",
      "selectEdge",
      "selectNode"
    );

    cy.visSnapshotOpenedPage(
      "select-three-by-two-drags-(TR_to_BL_then_BL_to_TR)"
    );
  });

  it("Select via method", function (): void {
    cy.visRun(({ network }): void => {
      network.setSelection({
        nodes: ["N_1", "N_3"],
        edges: ["E_1-2", "E_1-3", "E_1-4", "E_1-5", "E_3-4", "E_2-3"],
      });
    });
    cy.visShiftAndAssertEventNone(
      "deselectEdge",
      "deselectNode",
      "select",
      "selectEdge",
      "selectNode"
    );

    cy.visSnapshotOpenedPage("select-via-method");
  });

  it("Programatic selection", function (): void {
    cy.visRun(({ network }): void => {
      network.setSelection({ nodes: ["N_1", "N_5"] }, { unselectAll: false });
    });
    cy.visShiftAndAssertEventNone(
      "deselectEdge",
      "deselectNode",
      "select",
      "selectEdge",
      "selectNode"
    );
    cy.visSnapshotOpenedPage("programmatic-select-nodes");

    cy.visRun(({ network }): void => {
      network.setSelection(
        { edges: ["E_2-3", "E_3-4"] },
        { unselectAll: false }
      );
    });
    cy.visShiftAndAssertEventNone(
      "deselectEdge",
      "deselectNode",
      "select",
      "selectEdge",
      "selectNode"
    );
    cy.visSnapshotOpenedPage("programmatic-select-edges");

    cy.visRun(({ network }): void => {
      network.unselectAll();
    });
    cy.visShiftAndAssertEventNone(
      "deselectEdge",
      "deselectNode",
      "select",
      "selectEdge",
      "selectNode"
    );
    cy.visSnapshotOpenedPage("programmatic-select-unselect-all");
  });
});
