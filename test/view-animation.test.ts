import { expect } from "chai";
import Emitter from "component-emitter";

import View from "../lib/network/modules/View.js";

/**
 * Create a View with a minimal body and identity canvas.
 * @returns The view and its emitter.
 */
function createView(): { view: any; emitter: any } {
  const emitter = new Emitter();
  const body = {
    emitter,
    view: { scale: 1, translation: { x: 0, y: 0 } },
    nodes: {},
  };
  const canvas = {
    frame: { canvas: { clientWidth: 0, clientHeight: 0 } },
    DOMtoCanvas: (pos: { x: number; y: number }) => ({
      x: (pos.x - body.view.translation.x) / body.view.scale,
      y: (pos.y - body.view.translation.y) / body.view.scale,
    }),
  };

  return { view: new View(body, canvas), emitter };
}

/**
 * @param scale - Target scale.
 * @returns Animated moveTo options.
 */
function animatedMove(scale: number): object {
  return {
    position: { x: 0, y: 0 },
    scale,
    offset: { x: 0, y: 0 },
    animation: { duration: 100, easingFunction: "linear" },
  };
}

describe("View animation", function (): void {
  it("does not leak a pending animation when a new one starts before the first frame", function (): void {
    const { view, emitter } = createView();

    view.animateView(animatedMove(2));
    view.animateView(animatedMove(3));

    expect(emitter.listeners("initRedraw")).to.have.lengthOf(1);

    for (let i = 0; i < 20; i++) {
      emitter.emit("initRedraw");
    }

    expect(emitter.listeners("initRedraw")).to.have.lengthOf(0);
    expect(view.body.view.scale).to.be.closeTo(3, 0.2);
  });
});
