context("Z-index", (): void => {
  it("node labels > nodes > edge labels > edge arrows > edges", (): void => {
    cy.visSimpleCanvasSnapshot(
      "node-labels_nodes_edge-labels_edge-arrows_edges",
      {
        nodes: [
          {
            id: 1,
            fixed: true,
            x: 0,
            y: -300,
            shape: "dot",
            label: new Array(15)
              .fill(null)
              .map(
                (): string =>
                  "This label should be above edge labels and arrows."
              )
              .join("\n"),
            font: {
              color: "green",
              size: 40,
            },
          },
          {
            id: 3,
            fixed: true,
            x: 100,
            y: 300,
            shape: "box",
            label: new Array(5)
              .fill(null)
              .map(
                (): string =>
                  "This label should be above edge labels but bellow arrows."
              )
              .join("\n"),
            font: {
              color: "black",
              size: 20,
            },
          },
        ],
        edges: [
          {
            id: 2,
            from: 1,
            to: 3,
            label: new Array(80)
              .fill(null)
              .map(
                (): string =>
                  "This label should be bellow nodes and their labels but above edge arrows."
              )
              .join("\n"),
            font: {
              color: "red",
              size: 10,
            },
            arrows: {
              from: {
                enabled: true,
                scaleFactor: 6,
              },
              middle: {
                enabled: true,
                scaleFactor: 6,
              },
              to: {
                enabled: true,
                scaleFactor: 6,
              },
            },
            endPointOffset: {
              from: -50,
              to: -50,
            },
          },
        ],
      }
    );
  });
});
