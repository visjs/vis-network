import { expect } from "chai";
import { spy } from "sinon";

import LayoutEngine from "../lib/network/modules/LayoutEngine";

describe("LayoutEngine", function (): void {
  describe("setupHierarchicalLayout", function (): void {
    const generateTree = (
      edgeConnections: { from: number; to: number }[],
      nodeIds: number[] = []
    ): any => {
      const nodes: Record<number, any> = {};
      const edges: Record<number, any> = {};

      const uniqueNodeIds = new Set<number>(nodeIds);
      edgeConnections.forEach(({ from, to }): void => {
        uniqueNodeIds.add(from).add(to);
      });

      uniqueNodeIds.forEach((id): void => {
        nodes[id] = {
          id,
          edges: [],
          options: { fixed: {} },
        };
      });
      edgeConnections.forEach(({ from, to }): void => {
        const id = from * 10000 + to;

        edges[id] = {
          id,
          fromId: from,
          from: nodes[from],
          toId: to,
          to: nodes[to],
          connected: true,
        };

        nodes[from].edges.push(edges[id]);
        nodes[to].edges.push(edges[id]);
      });

      return {
        edgeIndices: Object.values(edges).map(({ id }): number => id),
        edges,
        nodeIndices: Object.values(nodes).map(({ id }): number => id),
        nodes,
      };
    };

    describe("directed", function (): void {
      describe("valid", function (): void {
        [
          {
            name: "3 nodes, 2 levels",
            tree: generateTree([
              { from: 8, to: 4 },
              { from: 8, to: 6 },
            ]),
            levels: {
              4: 1,
              6: 1,
              8: 0,
            },
          },
          {
            name: "6 nodes, 2 levels, 2 disconnected trees",
            tree: generateTree([
              { from: 28, to: 26 },
              { from: 18, to: 14 },
              { from: 18, to: 16 },
              { from: 28, to: 24 },
            ]),
            levels: {
              14: 1,
              16: 1,
              18: 0,
              24: 1,
              26: 1,
              28: 0,
            },
          },
          {
            name: "6 nodes, 4 levels, 2 roots",
            tree: generateTree([
              { from: 6, to: 0 },
              { from: 9, to: 5 },
              { from: 7, to: 4 },
              { from: 4, to: 0 },
              { from: 9, to: 6 },
              { from: 4, to: 6 },
              { from: 7, to: 5 },
            ]),
            levels: {
              0: 3,
              4: 1,
              5: 3,
              6: 2,
              7: 0,
              9: 1,
            },
          },
          {
            name: "7 nodes, 5 levels",
            tree: generateTree([
              { from: 5, to: 6 },
              { from: 6, to: 7 },
              { from: 2, to: 4 },
              { from: 3, to: 5 },
              { from: 1, to: 3 },
              { from: 4, to: 5 },
            ]),
            levels: {
              1: 0,
              2: 0,
              3: 1,
              4: 1,
              5: 2,
              6: 3,
              7: 4,
            },
          },
          {
            name: "7 nodes, 5 levels, with circle edges",
            tree: generateTree([
              { from: 4, to: 5 },
              { from: 5, to: 6 },
              { from: 4, to: 4 },
              { from: 6, to: 7 },
              { from: 3, to: 3 },
              { from: 3, to: 3 },
              { from: 3, to: 3 },
              { from: 3, to: 5 },
              { from: 1, to: 3 },
              { from: 6, to: 6 },
              { from: 2, to: 2 },
              { from: 2, to: 4 },
            ]),
            levels: {
              1: 0,
              2: 0,
              3: 1,
              4: 1,
              5: 2,
              6: 3,
              7: 4,
            },
          },
          {
            name: "10 nodes, 4 levels, edges skipping levels",
            tree: generateTree([
              { from: 9, to: 5 },
              { from: 2, to: 0 },
              { from: 7, to: 5 },
              { from: 6, to: 2 },
              { from: 3, to: 0 },
              { from: 8, to: 5 },
              { from: 1, to: 0 },
              { from: 5, to: 2 },
              { from: 4, to: 2 },
            ]),
            levels: {
              0: 3,
              1: 2,
              2: 2,
              3: 2,
              4: 1,
              5: 1,
              6: 1,
              7: 0,
              8: 0,
              9: 0,
            },
          },
          {
            name: "20 nodes, 5 levels, balanced binary tree",
            tree: generateTree([
              { from: 7, to: 14 },
              { from: 10, to: 20 },
              { from: 14, to: 29 },
              { from: 6, to: 12 },
              { from: 8, to: 17 },
              { from: 12, to: 25 },
              { from: 3, to: 7 },
              { from: 2, to: 5 },
              { from: 15, to: 30 },
              { from: 4, to: 8 },
              { from: 4, to: 9 },
              { from: 11, to: 23 },
              { from: 7, to: 15 },
              { from: 15, to: 31 },
              { from: 10, to: 21 },
              { from: 6, to: 13 },
              { from: 12, to: 24 },
              { from: 5, to: 11 },
              { from: 14, to: 28 },
              { from: 11, to: 22 },
              { from: 5, to: 10 },
              { from: 13, to: 26 },
              { from: 9, to: 18 },
              { from: 1, to: 2 },
              { from: 3, to: 6 },
              { from: 2, to: 4 },
              { from: 1, to: 3 },
              { from: 9, to: 19 },
              { from: 8, to: 16 },
              { from: 13, to: 27 },
            ]),
            levels: {
              1: 0,
              2: 1,
              3: 1,
              4: 2,
              5: 2,
              6: 2,
              7: 2,
              8: 3,
              9: 3,
              10: 3,
              11: 3,
              12: 3,
              13: 3,
              14: 3,
              15: 3,
              16: 4,
              17: 4,
              18: 4,
              19: 4,
              20: 4,
              21: 4,
              22: 4,
              23: 4,
              24: 4,
              25: 4,
              26: 4,
              27: 4,
              28: 4,
              29: 4,
              30: 4,
              31: 4,
            },
          },
          {
            name: "36 nodes, 19 levels",
            tree: generateTree([
              { from: 12, to: 22 },
              { from: 12, to: 43 },
              { from: 121, to: 131 },
              { from: 72, to: 82 },
              { from: 171, to: 181 },
              { from: 81, to: 91 },
              { from: 111, to: 122 },
              { from: 22, to: 31 },
              { from: 161, to: 171 },
              { from: 91, to: 121 },
              { from: 141, to: 151 },
              { from: 91, to: 101 },
              { from: 83, to: 91 },
              { from: 73, to: 83 },
              { from: 62, to: 72 },
              { from: 11, to: 42 },
              { from: 162, to: 171 },
              { from: 51, to: 61 },
              { from: 152, to: 162 },
              { from: 131, to: 141 },
              { from: 151, to: 161 },
              { from: 31, to: 41 },
              { from: 122, to: 131 },
              { from: 43, to: 52 },
              { from: 41, to: 52 },
              { from: 11, to: 21 },
              { from: 112, to: 123 },
              { from: 123, to: 131 },
              { from: 71, to: 81 },
              { from: 82, to: 91 },
              { from: 21, to: 31 },
              { from: 101, to: 112 },
              { from: 142, to: 151 },
              { from: 52, to: 62 },
              { from: 42, to: 52 },
              { from: 181, to: 191 },
              { from: 132, to: 142 },
              { from: 61, to: 71 },
            ]),
            levels: {
              11: 0,
              12: 0,
              21: 1,
              22: 1,
              31: 2,
              41: 3,
              42: 3,
              43: 3,
              51: 4,
              52: 4,
              61: 5,
              62: 5,
              71: 6,
              72: 6,
              73: 6,
              81: 7,
              82: 7,
              83: 7,
              91: 8,
              101: 9,
              111: 10,
              112: 10,
              121: 11,
              122: 11,
              123: 11,
              131: 12,
              132: 12,
              141: 13,
              142: 13,
              151: 14,
              152: 14,
              161: 15,
              162: 15,
              171: 16,
              181: 17,
              191: 18,
            },
          },
        ].forEach(({ name, tree, levels }): void => {
          it(name, function (): void {
            const body = Object.freeze({
              ...tree,

              emitter: Object.freeze({
                on: spy(),
                emit: spy(),
              }),
            });

            const le = new LayoutEngine(body);
            le.setOptions(
              {
                hierarchical: {
                  direction: "UD",
                  sortMethod: "directed",
                },
              },
              {}
            );

            le.setupHierarchicalLayout();

            expect(le.hierarchical.levels).to.deep.equal(levels);
          });
        });
      });

      describe("cycles (shouldn’t timeout, OOM, etc.)", function (): void {
        [
          {
            name: "3 nodes, cyclic, bidirectional edge",
            tree: generateTree([
              { from: 8, to: 6 },
              { from: 6, to: 8 },
              { from: 8, to: 4 },
            ]),
            levelKeys: [4, 6, 8],
          },
          {
            name: "3 nodes, cyclic, no bidirectional edges",
            tree: generateTree([
              { from: 3, to: 1 },
              { from: 1, to: 2 },
              { from: 2, to: 3 },
            ]),
            levelKeys: [1, 2, 3],
          },
        ].forEach(({ name, tree, levelKeys }): void => {
          it(name, function (): void {
            const body = Object.freeze({
              ...tree,

              emitter: Object.freeze({
                on: spy(),
                emit: spy(),
              }),
            });

            const le = new LayoutEngine(body);
            le.setOptions(
              {
                hierarchical: {
                  direction: "UD",
                  sortMethod: "directed",
                },
              },
              {}
            );

            le.setupHierarchicalLayout();

            expect(le.hierarchical.levels).to.have.keys(levelKeys);
          });
        });
      });
    });
  });
});
