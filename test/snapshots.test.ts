/* Note: These tests may be a bit fragile. Changes were made in the library to
 * ensure they pass everywhere but in case you checkout the repo, npm cit and
 * the tests don't pass use the following link to open an issue, thanks.
 * <https://github.com/visjs/vis-network/issues/new?title=Pinning%20tests%20fail%20in%20my%20environment&body=The%20pinning%20tests%20fail%20for%20no%20reason.%0A%0A%23%23%23%20Environment%0A-%20Operating%20system%3A%20e.g.%20%60Windows%2010%20build%2017134.1184%60%20%20or%20%60Arch%20Linux%20up%20to%20date%20to%202020%2F01%2F13%60%0A-%20Interpreter%3A%20e.g.%20%60Node%2013.7.1%60%0A%0A%23%23%23%20Interesting%20part%20of%20%60npm%20test%60%20output%0A%60%60%60%0A%0A%60%60%60%0A%0A%23%23%23%20Additional%20info%0AIf%20you%20have%20something%20that%20might%20help%20debug%20this%20issue%20place%20it%20here%2C%20if%20not%20no%20problem%20simply%20delete%20this.>
 */

import Network from "../lib/network/Network";
import { canvasMockify } from "./canvas-mock";
import snapshot from "snap-shot-it";

const optionsConfigs = [
  {
    name: "defaults",
    options: {},
  },
  {
    name: "Barnes Hut defaults",
    options: { physics: { solver: "barnesHut" } },
  },
  {
    name: "Force Atlas 2 defaults",
    options: { physics: { solver: "forceAtlas2Based" } },
  },
  {
    name: "Repulstion defaults",
    options: { physics: { solver: "repulsion" } },
  },
];

const dataconfigs = [
  {
    name: "2 disconnected nodes",
    data: { nodes: [{ id: 1 }, { id: 2 }], edges: [] },
  },
  {
    name: "2 connected nodes",
    data: { nodes: [{ id: 1 }, { id: 2 }], edges: [{ from: 1, to: 2 }] },
  },
  {
    name: "2 doubly connected nodes",
    data: {
      nodes: [{ id: 1 }, { id: 2 }],
      edges: [
        { from: 1, to: 2 },
        { from: 1, to: 2 },
      ],
    },
  },
  {
    name: "6 node star",
    data: {
      nodes: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }, { id: 6 }],
      edges: [
        { from: 1, to: 2 },
        { from: 1, to: 3 },
        { from: 1, to: 4 },
        { from: 1, to: 5 },
        { from: 1, to: 6 },
      ],
    },
  },
  {
    name: "6 node circle",
    data: {
      nodes: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }, { id: 6 }],
      edges: [
        { from: 1, to: 2 },
        { from: 2, to: 3 },
        { from: 3, to: 4 },
        { from: 4, to: 5 },
        { from: 5, to: 6 },
        { from: 6, to: 1 },
      ],
    },
  },
  {
    name: "6 node complete graph",
    data: {
      nodes: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }, { id: 6 }],
      edges: [
        { from: 1, to: 2 },
        { from: 1, to: 3 },
        { from: 1, to: 4 },
        { from: 1, to: 5 },
        { from: 1, to: 6 },
        { from: 2, to: 1 },
        { from: 2, to: 3 },
        { from: 2, to: 4 },
        { from: 2, to: 5 },
        { from: 2, to: 6 },
        { from: 3, to: 1 },
        { from: 3, to: 2 },
        { from: 3, to: 4 },
        { from: 3, to: 5 },
        { from: 3, to: 6 },
        { from: 4, to: 1 },
        { from: 4, to: 2 },
        { from: 4, to: 3 },
        { from: 4, to: 5 },
        { from: 4, to: 6 },
        { from: 5, to: 1 },
        { from: 5, to: 2 },
        { from: 5, to: 3 },
        { from: 5, to: 4 },
        { from: 5, to: 6 },
        { from: 6, to: 1 },
        { from: 6, to: 2 },
        { from: 6, to: 3 },
        { from: 6, to: 4 },
        { from: 6, to: 5 },
      ],
    },
  },
  {
    name: "binary tree",
    data: {
      nodes: [
        { id: 1 },
        { id: 2 },
        { id: 3 },
        { id: 4 },
        { id: 5 },
        { id: 6 },
        { id: 7 },
        { id: 8 },
        { id: 9 },
        { id: 10 },
        { id: 11 },
        { id: 12 },
        { id: 13 },
        { id: 14 },
        { id: 15 },
        { id: 16 },
        { id: 17 },
        { id: 18 },
        { id: 19 },
      ],
      edges: [
        { from: 1, to: 2 },
        { from: 1, to: 3 },
        { from: 2, to: 4 },
        { from: 2, to: 5 },
        { from: 3, to: 6 },
        { from: 3, to: 7 },
        { from: 4, to: 8 },
        { from: 4, to: 9 },
        { from: 5, to: 10 },
        { from: 5, to: 11 },
        { from: 6, to: 12 },
        { from: 6, to: 13 },
        { from: 7, to: 14 },
        { from: 7, to: 15 },
        { from: 8, to: 16 },
        { from: 8, to: 17 },
        { from: 9, to: 18 },
        { from: 9, to: 19 },
      ],
    },
  },
];

describe("Physics snapshots", function (): void {
  beforeEach(function () {
    this.clearJSDOM = canvasMockify("<div id='mynetwork'></div>");
    this.container = document.getElementById("mynetwork");
  });

  afterEach(function () {
    this.clearJSDOM();

    delete this.clearJSDOM;
    delete this.container;
  });

  for (const { name: optionsName, options } of optionsConfigs) {
    describe(optionsName, function (): void {
      for (const { name: dataName, data } of dataconfigs) {
        it(dataName, async function (): Promise<void> {
          const optionsWithSeed = {
            ...options,
            layout: {
              ...((options as any).layout || {}),
              // Set the seed to always get the same layout.
              randomSeed: 159,
            },
          };

          const network = new Network(this.container, data, optionsWithSeed);

          // Wait for the physics to stabilize.
          await new Promise((resolve): void => {
            network.on("stabilized", resolve);
          });

          snapshot(network.getPositions());
        });
      }
    });
  }
});
