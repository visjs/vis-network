const CONFIG = {
  nodes: [
    { id: "730", label: "730" },
    { id: "748", label: "748" },
    { id: "755", label: "755" },
    { id: "757", label: "757" },
    { id: "758", label: "758" },
    { id: "759", label: "759" },
    { id: "762", label: "762" },
    { id: "780", label: "780" },
    { id: "782", label: "782" },
    { id: "794", label: "794" },
    { id: "796", label: "796" },
    { id: "813c", label: "813c" },
    { id: "814c", label: "814c" },
    { id: "824c", label: "824c" },
    { id: "828c", label: "828c" },
    { id: "838c", label: "838c" },
    { id: "839c", label: "839c" },
    { id: "950", label: "950" },
    { id: "968", label: "968" },
  ],
  edges: [
    { id: "730-762", from: "730", to: "762" },
    { id: "813c-824c", from: "813c", to: "824c" },
    { id: "730-757", from: "730", to: "757" },
    { id: "730-759", from: "730", to: "759" },
    { id: "814c-839c", from: "814c", to: "839c" },
    { id: "828c-950", from: "828c", to: "950" },
    { id: "758-780", from: "758", to: "780" },
    { id: "762-782", from: "762", to: "782" },
    { id: "757-796", from: "757", to: "796" },
    { id: "755-796", from: "755", to: "796" },
    { id: "730-755", from: "730", to: "755" },
    { id: "814c-838c", from: "814c", to: "838c" },
    { id: "730-758", from: "730", to: "758" },
    { id: "839c-968", from: "839c", to: "968" },
    { id: "824c-968", from: "824c", to: "968" },
    { id: "828c-968", from: "828c", to: "968" },
    { id: "838c-968", from: "838c", to: "968" },
    { id: "796-814c", from: "796", to: "814c" },
    { id: "796-813c", from: "796", to: "813c" },
    { id: "757-794", from: "757", to: "794" },
    { id: "813c-828c", from: "813c", to: "828c" },
    { id: "759-748", from: "759", to: "748" },
    { id: "968-748", from: "968", to: "748" },
    { id: "782-748", from: "782", to: "748" },
    { id: "780-748", from: "780", to: "748" },
    { id: "950-748", from: "950", to: "748" },
    { id: "794-748", from: "794", to: "748" },
  ],
  options: {
    edges: {
      arrows: "to",
    },
    layout: {
      improvedLayout: true,
      hierarchical: {
        sortMethod: "directed",
      },
    },
  },
};

context("Hierarchical layout directed levels", (): void => {
  it("Without clusters", (): void => {
    cy.visVisitUniversal(CONFIG);
    cy.visSnapshotOpenedPage(
      "layout-hierarchical-directed-levels-without-clusters"
    );
  });

  it("With clusters", (): void => {
    cy.visVisitUniversal(CONFIG, { requireNewerVersionThan: "8.2.0" });
    cy.visRun(({ network }): void => {
      const clusterOptionsByData = {
        joinCondition(childOptions: { id: string | number }) {
          return ("" + childOptions.id).endsWith("c");
        },
        clusterNodeProperties: {
          id: "cluster",
          label: "cluster",
          borderWidth: 3,
          shape: "database",
        },
      };
      network.cluster(clusterOptionsByData);
    });
    cy.visSnapshotOpenedPage(
      "layout-hierarchical-directed-levels-with-clusters"
    );
  });
});
