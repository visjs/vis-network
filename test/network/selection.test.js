import { expect } from "chai";
import Network from "../../lib/network/Network";
import { canvasMockify } from "../canvas-mock";
import { sortArrays } from "../helpers";

describe("Network", function () {
  before(function () {
    this.jsdom_global = canvasMockify("<div id='mynetwork'></div>");
    this.container = document.getElementById("mynetwork");
  });

  after(function () {
    this.jsdom_global();
  });

  it("programatic selection", function () {
    const network = new Network(
      this.container,
      {
        nodes: [
          { id: "N_1" },
          { id: "N_2" },
          { id: "N_3" },
          { id: "N_4" },
          { id: "N_5" },
        ],
        edges: [
          { id: "E_1-2", from: "N_1", to: "N_2" },
          { id: "E_1-3", from: "N_1", to: "N_3" },
          { id: "E_1-4", from: "N_1", to: "N_4" },
          { id: "E_1-5", from: "N_1", to: "N_5" },

          { id: "E_2-3", from: "N_2", to: "N_3" },
          { id: "E_3-4", from: "N_3", to: "N_4" },
          { id: "E_4-5", from: "N_4", to: "N_5" },
          { id: "E_5-2", from: "N_5", to: "N_2" },
        ],
      },
      { physics: false }
    );

    // Select a node with it's edges.
    network.setSelection({ nodes: ["N_5"] }, { unselectAll: false });
    expect(sortArrays(network.getSelection())).to.deep.equal(
      sortArrays({
        nodes: ["N_5"],
        edges: ["E_1-5", "E_4-5", "E_5-2"],
      })
    );

    // Select a node without it's edges.
    network.setSelection(
      { nodes: ["N_1"] },
      { highlightEdges: false, unselectAll: false }
    );
    expect(sortArrays(network.getSelection())).to.deep.equal(
      sortArrays({
        nodes: ["N_1", "N_5"],
        edges: ["E_1-5", "E_4-5", "E_5-2"],
      })
    );

    // Select some edges.
    network.setSelection({ edges: ["E_2-3", "E_3-4"] }, { unselectAll: false });
    expect(sortArrays(network.getSelection())).to.deep.equal(
      sortArrays({
        nodes: ["N_1", "N_5"],
        edges: ["E_1-5", "E_4-5", "E_5-2", "E_2-3", "E_3-4"],
      })
    );

    // Unselect all.
    network.unselectAll();
    expect(sortArrays(network.getSelection())).to.deep.equal(
      sortArrays({
        nodes: [],
        edges: [],
      })
    );
  });
});
