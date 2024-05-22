import { expect } from "chai";
import Network from "../../lib/network/Network";
import { canvasMockify } from "../canvas-mock";

describe("wind", function (): void {
  beforeEach(function () {
    this.clearJSDOM = canvasMockify("<div id='mynetwork'></div>");
    this.container = document.getElementById("mynetwork");
  });

  afterEach(function () {
    this.clearJSDOM();

    delete this.clearJSDOM;
    delete this.container;
  });

  it("All nodes are on the correct side of the fixed node", async function (): Promise<void> {
    const network = new Network(
      this.container,
      {
        nodes: [
          { id: 1, fixed: true, x: 0, y: 0 },
          { id: 2 },
          { id: 3 },
          { id: 4 },
        ],
        edges: [
          { from: 1, to: 2 },
          { from: 2, to: 3 },
          { from: 3, to: 4 },
        ],
      },
      { physics: { wind: { x: 10, y: 0 }, stabilization: { iterations: 10 } } }
    );

    // Wait for the physics to stabilize.
    await new Promise((resolve): void => {
      network.on("stabilized", resolve);
    });

    const positions = network.getPositions();
    expect(positions[2].x).to.be.greaterThan(0);
    expect(positions[3].x).to.be.greaterThan(0);
    expect(positions[4].x).to.be.greaterThan(0);
  });
});
