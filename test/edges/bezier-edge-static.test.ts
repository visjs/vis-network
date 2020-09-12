import { expect } from "chai";
import { assert, spy } from "sinon";
import { deepFreeze } from "../helpers";
import { body, mockedBody } from "./helpers";

import { BezierEdgeStatic } from "../../lib/network/modules/components/edges";

describe("BezierEdgeStatic", function (): void {
  it("constructor", function (): void {
    const options = deepFreeze({
      id: "E",
      from: 1,
      to: 3,
      smooth: {
        roundness: 2,
      },
    });

    const edge = new BezierEdgeStatic(options, body as any, {} as any);

    expect(edge).to.have.ownProperty("options").that.equals(options);
    expect(edge).to.have.ownProperty("from").that.equals(body.nodes[1]);
    expect(edge).to.have.ownProperty("to").that.equals(body.nodes[3]);
    expect(edge).to.have.ownProperty("id").that.equals("E");
  });

  describe("drawLine", function (): void {
    it("solid", function (): void {
      const ctx = {
        beginPath: spy(),
        moveTo: spy(),
        quadraticCurveTo: spy(),
        stroke: spy(),
      };

      const edge = new BezierEdgeStatic(
        {
          id: "E",
          from: 1,
          to: 3,
          smooth: {
            roundness: 2,
          },
        },
        body as any,
        {} as any
      );

      edge.drawLine(ctx, { dashes: false }, false, false, body.nodes[2]);

      assert.calledOnce(ctx.beginPath);
      assert.alwaysCalledOn(ctx.beginPath, ctx);
      assert.alwaysCalledWithExactly(ctx.beginPath);

      assert.calledOnce(ctx.moveTo);
      assert.alwaysCalledOn(ctx.moveTo, ctx);
      assert.alwaysCalledWithExactly(ctx.moveTo, 100, -100);

      assert.calledOnce(ctx.quadraticCurveTo);
      assert.alwaysCalledOn(ctx.quadraticCurveTo, ctx);
      assert.alwaysCalledWithExactly(
        ctx.quadraticCurveTo,
        200,
        -200,
        300,
        -300
      );

      assert.calledTwice(ctx.stroke);
      assert.alwaysCalledOn(ctx.stroke, ctx);
      assert.alwaysCalledWithExactly(ctx.stroke);
    });

    it("dashed", function (): void {
      const ctx = {
        beginPath: spy(),
        lineTo: spy(),
        moveTo: spy(),
        stroke: spy(),
      };

      const edge = new BezierEdgeStatic(
        {
          id: "E",
          from: 1,
          to: 3,
          smooth: {
            roundness: 2,
          },
        },
        body as any,
        {} as any
      );

      edge.drawLine(
        ctx as any,
        { dashes: [1, 2, 3] } as any,
        false,
        false,
        body.nodes[2]
      );

      assert.calledOnce(ctx.beginPath);
      assert.alwaysCalledOn(ctx.beginPath, ctx);
      assert.alwaysCalledWithExactly(ctx.beginPath);

      assert.callCount(ctx.lineTo, 71);
      assert.alwaysCalledOn(ctx.lineTo, ctx);

      assert.callCount(ctx.moveTo, 72);
      assert.alwaysCalledOn(ctx.moveTo, ctx);

      assert.calledOnce(ctx.stroke);
      assert.alwaysCalledOn(ctx.stroke, ctx);
      assert.alwaysCalledWithExactly(ctx.stroke);
    });
  });

  describe("getViaNode", function (): void {
    [
      { type: "continuous", from: 1, to: 3, node: { x: 300, y: -500 } },
      { type: "continuous", from: 3, to: 1, node: { x: 100, y: 100 } },
      { type: "continuous", from: 6, to: "T", node: { x: -400, y: -400 } },
      { type: "curvedCCW", from: 1, to: 3, node: { x: -200, y: 200 } },
      { type: "curvedCW", from: 1, to: 3, node: { x: -200, y: 200 } },
      { type: "diagonalCross", from: 1, to: 3, node: { x: 500, y: -500 } },
      { type: "diagonalCross", from: 3, to: 1, node: { x: -100, y: 100 } },
      { type: "diagonalCross", from: 6, to: "T", node: { x: -400, y: 400 } },
      { type: "discrete", from: 1, to: 3, node: { x: 100, y: -500 } },
      { type: "discrete", from: 6, to: "T", node: { x: -400, y: -600 } },
      { type: "horizontal", from: 1, to: 3, node: { x: 500, y: -100 } },
      { type: "horizontal", from: 3, to: 1, node: { x: -100, y: -300 } },
      { type: "straightCross", from: 1, to: 3, node: { x: 300, y: -500 } },
      { type: "straightCross", from: 3, to: 1, node: { x: 100, y: 100 } },
      { type: "straightCross", from: 6, to: "T", node: { x: -400, y: -400 } },
      { type: "vertical", from: 1, to: 3, node: { x: 100, y: -500 } },
      { type: "vertical", from: 3, to: 1, node: { x: 300, y: 100 } },
    ].forEach(({ from, node, to, type }): void => {
      it(`${type} (${from} → ${to})`, function (): void {
        const edge = new BezierEdgeStatic(
          {
            id: "E",
            from,
            to,
            smooth: {
              roundness: 2,
              type,
            },
          },
          body as any,
          {} as any
        );

        const viaNode = edge.getViaNode();

        expect(viaNode).to.be.an("object");
        expect(viaNode, "x")
          .to.have.ownProperty("x")
          .that.is.closeTo(node.x, 0.5);
        expect(viaNode, "y")
          .to.have.ownProperty("y")
          .that.is.closeTo(node.y, 0.5);
      });
    });
  });

  it("getPoint", function (): void {
    const edge = new BezierEdgeStatic(
      {
        id: "E",
        from: 1,
        to: 3,
        smooth: {
          roundness: 2,
        },
      },
      body as any,
      {} as any
    );

    expect(edge.getPoint(0.5)).to.deep.equal({
      x: 250,
      y: -350,
    });
  });

  describe("findBorderPosition", function (): void {
    it("2 nodes", function (): void {
      const body = mockedBody();

      const edge = new BezierEdgeStatic(
        {
          id: "E",
          from: 1,
          to: 3,
          smooth: {
            roundness: 2,
          },
        },
        body,
        {} as any
      );

      const { x, y } = edge._findBorderPosition(body.nodes.O, null);

      expect(x, "x").to.be.closeTo(100, 0.5);
      expect(y, "y").to.be.closeTo(-101, 0.5);
    });

    it("from node", function (): void {
      const body = mockedBody();

      const edge = new BezierEdgeStatic(
        {
          id: "E",
          from: 1,
          to: 3,
          smooth: {
            roundness: 2,
          },
        },
        body,
        {} as any
      );

      const { x, y } = edge._findBorderPosition(body.nodes[1], null);

      expect(x, "x").to.be.closeTo(151, 0.5);
      expect(y, "y").to.be.closeTo(-199, 0.5);
    });

    it("to node", function (): void {
      const body = mockedBody();

      const edge = new BezierEdgeStatic(
        {
          id: "E",
          from: 1,
          to: 3,
          smooth: {
            roundness: 2,
          },
        },
        body,
        {} as any
      );

      const { x, y } = edge._findBorderPosition(body.nodes[3], null);

      expect(x, "x").to.be.closeTo(100, 0.5);
      expect(y, "y").to.be.closeTo(-101, 0.5);
    });
  });

  it("_getDistanceToEdge", function (): void {
    const edge = new BezierEdgeStatic(
      {
        id: "E",
        from: 1,
        to: 3,
        smooth: {
          roundness: 2,
        },
      },
      body as any,
      {} as any
    );

    expect(edge._getDistanceToEdge(10, -10, 20, -20, 10, 20)).to.equal(30);
  });
});
