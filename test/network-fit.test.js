import { expect } from "chai";
import { createSandbox } from "sinon";

import { Network } from "../lib/network/Network.js";
import { canvasMockify } from "./canvas-mock.js";

describe("Network fit", function () {
  it("keeps the fitted scale when the box corner radius changes", function () {
    const cleanup = canvasMockify('<div id="network"></div>');
    const sandbox = createSandbox();
    let network;
    try {
      network = new Network(
        document.getElementById("network"),
        {
          nodes: [
            { id: 1, label: "box", x: -200, y: 0 },
            { id: 2, label: "box", x: 200, y: 0 },
          ],
          edges: [],
        },
        { autoResize: false, nodes: { shape: "box" }, physics: false },
      );
      const canvas = document.querySelector("canvas");
      sandbox.stub(canvas, "clientWidth").value(400);
      sandbox.stub(canvas, "clientHeight").value(400);

      network.fit({ animation: false });
      const scale = network.getScale();
      expect(scale).to.be.greaterThan(0).and.lessThan(1);
      const scales = [scale];
      for (const borderRadius of [0, 200]) {
        network.setOptions({ nodes: { shapeProperties: { borderRadius } } });
        network.fit({ animation: false });
        scales.push(network.getScale());
      }
      expect(scales).to.deep.equal([scale, scale, scale]);
    } finally {
      network?.destroy();
      sandbox.restore();
      cleanup();
    }
  });
});
