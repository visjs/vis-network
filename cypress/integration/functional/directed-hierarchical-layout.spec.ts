import {
  IdType,
  Point,
  TestData,
  addMoreEdges,
  generateMaryTree,
} from "../helpers";

/**
 * Generate a consecutive list of ids starting with first and ending with last
 * including both.
 *
 * @param first - Number of the first id to generate.
 * @param last - Number of the last id to generate.
 * @returns An array of ids for example `"node0"` or `"node789"`.
 */
function nodeIdRange(first: number, last: number): IdType[] {
  return new Array(1 + last - first)
    .fill(null)
    .map((_, i): IdType => `node${first + i}`);
}

describe("Directed hierarchical layout", (): void => {
  const configs: {
    /**
     * The name that will be displayed by Cypress for given test.
     */
    name: string;
    /**
     * Data in the same format as in `new Network(container, data, options);`.
     */
    data: TestData;
    /**
     * Each member of this list clusters more nodes. Swallows edges refers to
     * how many edges disappear from the network thanks to the newly created
     * cluster.
     *
     * @remarks The result of this is accumulated. For example for three lists
     * of node ids four tests will be run: One with no clusters, one with first
     * cluster, one with first and second and one with first through third
     * clusters.
     */
    clusterConfigs?: { nodes: IdType[]; swallowsEdges: number }[];
    /**
     * This skips some checks that just can't be passed by a cyclic graph.
     */
    cyclic: boolean;
  }[] = [
    {
      name: "Binary tree",
      data: generateMaryTree(63, 2),
      clusterConfigs: [{ nodes: nodeIdRange(3, 6), swallowsEdges: 2 }],
      cyclic: false,
    },
    {
      name: "5-ary tree",
      data: generateMaryTree(156, 5),
      clusterConfigs: [
        {
          nodes: [
            ...nodeIdRange(2, 3),
            ...nodeIdRange(11, 20),
            ...nodeIdRange(56, 105),
          ],
          swallowsEdges: 61,
        },
      ],
      cyclic: false,
    },
    {
      name: "Acyclic graph",
      data: addMoreEdges(generateMaryTree(63, 2)),
      clusterConfigs: [
        {
          nodes: [
            ...nodeIdRange(2, 3),
            ...nodeIdRange(11, 20),
            ...nodeIdRange(56, 62),
          ],
          swallowsEdges: 31,
        },
      ],
      cyclic: false,
    },
    {
      name: "Cyclic graph (2 nodes)",
      data: {
        nodes: [
          { id: "node0", label: "Node #0" },
          { id: "node1", label: "Node #1" },
        ],
        edges: [
          { id: "edge_node0-node1", from: "node0", to: "node1" },
          { id: "edge_node1-node0", from: "node1", to: "node0" },
        ],
      },
      cyclic: true,
    },
    {
      name: "Cyclic graph (10 nodes)",
      data: {
        nodes: [
          { id: "node0", label: "Node #0" },
          { id: "node1", label: "Node #1" },
          { id: "node2", label: "Node #2" },
          { id: "node3", label: "Node #3" },
          { id: "node4", label: "Node #4" },
          { id: "node5", label: "Node #5" },
          { id: "node6", label: "Node #6" },
          { id: "node7", label: "Node #7" },
          { id: "node8", label: "Node #8" },
          { id: "node9", label: "Node #9" },
        ],
        edges: [
          { id: "edge_node1-node0", from: "node1", to: "node0" },
          { id: "edge_node0-node1", from: "node0", to: "node1" },
          { id: "edge_node1-node2", from: "node1", to: "node2" },
          { id: "edge_node2-node3", from: "node2", to: "node3" },
          { id: "edge_node3-node4", from: "node3", to: "node4" },
          { id: "edge_node4-node5", from: "node4", to: "node5" },
          { id: "edge_node5-node6", from: "node5", to: "node6" },
          { id: "edge_node6-node7", from: "node6", to: "node7" },
          { id: "edge_node7-node8", from: "node7", to: "node8" },
          { id: "edge_node8-node9", from: "node8", to: "node9" },
        ],
      },
      cyclic: true,
    },
    {
      name: "Linear",
      data: {
        nodes: [
          { id: "node0", label: "Node #0" },
          { id: "node1", label: "Node #1" },
          { id: "node2", label: "Node #2" },
          { id: "node3", label: "Node #3" },
          { id: "node4", label: "Node #4" },
          { id: "node5", label: "Node #5" },
          { id: "node6", label: "Node #6" },
          { id: "node7", label: "Node #7" },
          { id: "node8", label: "Node #8" },
          { id: "node9", label: "Node #9" },
        ],
        edges: [
          { id: "edge_node0-node1", from: "node0", to: "node1" },
          { id: "edge_node1-node2", from: "node1", to: "node2" },
          { id: "edge_node2-node3", from: "node2", to: "node3" },
          { id: "edge_node3-node4", from: "node3", to: "node4" },
          { id: "edge_node4-node5", from: "node4", to: "node5" },
          { id: "edge_node5-node6", from: "node5", to: "node6" },
          { id: "edge_node6-node7", from: "node6", to: "node7" },
          { id: "edge_node7-node8", from: "node7", to: "node8" },
          { id: "edge_node8-node9", from: "node8", to: "node9" },
        ],
      },
      clusterConfigs: [
        { nodes: ["node1"], swallowsEdges: 0 },
        { nodes: ["node2", "node3"], swallowsEdges: 1 },
        { nodes: ["node6", "node7", "node8"], swallowsEdges: 2 },
      ],
      cyclic: false,
    },
  ];

  configs.forEach(({ clusterConfigs, cyclic, data, name }): void => {
    const configs = [
      { nodes: [], swallowsEdges: 0 },
      ...(clusterConfigs || []),
    ].map(
      (
        { nodes },
        i,
        arr
      ): {
        expectedVisibleEdges: number;
        nodesToCluster: Set<IdType>;
      } => ({
        expectedVisibleEdges:
          data.edges.length -
          arr
            .slice(0, i + 1)
            .reduce((acc, { swallowsEdges }): number => acc + swallowsEdges, 0),
        nodesToCluster: new Set(nodes),
      })
    );

    describe(name, (): void => {
      it("Preparation", (): void => {
        cy.visVisitUniversal();

        cy.visRun(({ network, nodes, edges }): void => {
          network.setOptions({
            edges: {
              arrows: {
                to: true,
              },
            },
            layout: {
              hierarchical: {
                enabled: true,
                sortMethod: "directed",
              },
            },
          });

          nodes.add(data.nodes);
          edges.add(data.edges);
        });
      });

      configs.forEach(({ expectedVisibleEdges, nodesToCluster }, cid): void => {
        const clusterDescribeName =
          cid === 0 ? "Without clustering" : `With ${cid} clusters`;

        describe(clusterDescribeName, (): void => {
          if (cid > 0) {
            it("Cluster", (): void => {
              cy.visRun(({ network }): void => {
                network.cluster({
                  clusterNodeProperties: {
                    label: `Cluster #${cid}`,
                  },
                  joinCondition: ({ id }): boolean => nodesToCluster.has(id),
                });
              });
            });
          }

          /*
           * There's no point in testing running this test for cyclic graphs.
           * Such graphs are always invalid.
           */
          if (!cyclic) {
            /**
             * Test that children are placed below their parents and parents
             * above their children.
             *
             * This also tests that the required number of edges is visible on
             * the canvas. Since the number is available there anyway, it can as
             * well be tested.
             */
            it("Hierarchical order of nodes", (): void => {
              cy.visRun(({ network }): void => {
                const visibleNodeIds = new Set(
                  Object.keys(network.getPositions())
                );

                /*
                 * No matter how much ESLint think they're unnecessary, these two
                 * assertions are indeed necessary.
                 */
                const visibleEdges = Object.values(
                  (
                    network as unknown as {
                      body: {
                        edges: {
                          fromId: string;
                          toId: string;
                        }[];
                      };
                    }
                  ).body.edges
                ).filter(
                  (edge): boolean =>
                    visibleNodeIds.has(edge.fromId) &&
                    visibleNodeIds.has(edge.toId)
                );

                const invalidEdges = visibleEdges
                  .map(
                    ({
                      fromId,
                      toId,
                    }): {
                      fromId: IdType;
                      fromPosition: Point;
                      toId: IdType;
                      toPosition: Point;
                    } => ({
                      fromId,
                      fromPosition: network.getPositions([fromId])[fromId],
                      toId,
                      toPosition: network.getPositions([toId])[toId],
                    })
                  )
                  .filter(({ fromPosition, toPosition }): boolean => {
                    return !(fromPosition.y < toPosition.y);
                  });

                expect(invalidEdges).to.deep.equal([]);
                expect(visibleEdges).to.have.lengthOf(expectedVisibleEdges);
              });
            });

            /**
             * Test that all levels are evenly spaced without gaps.
             */
            it("Spacing between levels", (): void => {
              cy.visRun(({ network }): void => {
                const levels = Array.from(
                  new Set(
                    Object.values(network.getPositions()).map(
                      ({ y }): number => y
                    )
                  )
                ).sort((a, b): number => a - b);

                const gaps = new Array(levels.length - 1)
                  .fill(null)
                  .map((_, i): number => {
                    return levels[i] - levels[i + 1];
                  });

                expect(
                  gaps.every((gap, _i, arr): boolean => {
                    return gap === arr[0];
                  }),
                  "All levels should be evenly spaced without gaps."
                ).to.be.true;
              });
            });
          }

          /**
           * Click through the entire network to ensure that:
           *   - No node is off the canvas.
           *   - No node is covered behind another node.
           *   - Each node is selected after being clicked.
           */
          it("Click through the network", (): void => {
            cy.visStabilizeFitAndRun(({ network }): void => {
              network.unselectAll();
              expect(network.getSelectedNodes()).to.deep.equal([]);

              const visibleNodeIds = new Set(
                Object.keys(network.getPositions()).sort()
              );
              for (const id of visibleNodeIds) {
                cy.visClickNode(id);
              }
            });
          });
        });
      });
    });
  });
});
