context("Cluster and opening", (): void => {
  for (const { name, openClusterOptions } of [
    { name: "default release function", openClusterOptions: undefined },
    {
      name: "restore original positions",
      openClusterOptions: {
        releaseFunction: (_: unknown, positions: any): any => positions,
      },
    },
    {
      name: "custom positions",
      openClusterOptions: {
        releaseFunction: (): any => ({
          1: {
            x: 100,
            y: -100,
          },
          2: {
            x: 300,
            y: -300,
          },
          3: {
            x: -300,
            y: 300,
          },
          4: {
            x: 300,
            y: 300,
          },
          5: {
            x: -300,
            y: -300,
          },
        }),
      },
    },
  ] as const) {
    it(name, (): void => {
      cy.visVisitUniversal({
        nodes: [
          {
            id: 1,
            x: 0,
            y: 0,
            label: "node 1",
          },
          {
            id: 2,
            x: 200,
            y: 0,
            label: "node 2",
          },
          {
            id: 3,
            x: -200,
            y: 0,
            label: "node 3",
          },
          {
            id: 4,
            x: 0,
            y: 200,
            label: "node 4",
          },
          {
            id: 5,
            x: 0,
            y: -200,
            label: "node 5",
          },
        ],
        edges: [
          {
            from: 1,
            to: 2,
          },
          {
            from: 1,
            to: 3,
          },
          {
            from: 1,
            to: 4,
          },
          {
            from: 1,
            to: 5,
          },
        ],
        physics: false,
      });
      cy.wait(1000);
      cy.get("#mynetwork canvas").compareSnapshot(name + "-1-loaded");

      cy.visRun(({ network }): void => {
        network.cluster({
          joinCondition: () => true,
        });
      });
      cy.wait(1000);
      cy.get("#mynetwork canvas").compareSnapshot(name + "-2-clustered");

      cy.visRun(({ network }): void => {
        network.openCluster(
          Object.keys(network.getPositions())[0],
          openClusterOptions
        );
      });
      cy.wait(1000);
      cy.get("#mynetwork canvas").compareSnapshot(name + "-3-opened");
    });
  }
});
