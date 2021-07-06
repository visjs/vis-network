import { expect } from "chai";
import { assert, spy, stub } from "sinon";
import { deepFreeze } from "../helpers";
import { body } from "./helpers";

import { StraightEdge } from "../../lib/network/modules/components/edges";

describe("StraightEdge", function (): void {
  it("constructor", function (): void {
    const options = deepFreeze({
      id: "E",
      from: 1,
      to: 3,
    });

    const edge = new StraightEdge(options, body as any, {} as any);

    expect(edge).to.have.ownProperty("options").that.equals(options);
    expect(edge).to.have.ownProperty("from").that.equals(body.nodes[1]);
    expect(edge).to.have.ownProperty("to").that.equals(body.nodes[3]);
    expect(edge).to.have.ownProperty("id").that.equals("E");
  });

  describe("drawLine", function (): void {
    it("solid", function (): void {
      const ctx = {
        beginPath: spy(),
        lineTo: spy(),
        moveTo: spy(),
        stroke: spy(),
      };

      const edge = new StraightEdge(
        {
          id: "E",
          from: 1,
          to: 3,
        },
        body as any,
        {} as any
      );

      edge.drawLine(ctx, { dashes: false }, false, false, body.nodes[2]);

      assert.calledOnce(ctx.beginPath);
      assert.alwaysCalledOn(ctx.beginPath, ctx);
      assert.alwaysCalledWithExactly(ctx.beginPath);

      assert.calledOnce(ctx.lineTo);
      assert.alwaysCalledOn(ctx.lineTo, ctx);
      assert.alwaysCalledWithExactly(ctx.lineTo, 300, -300);

      assert.calledOnce(ctx.moveTo);
      assert.alwaysCalledOn(ctx.moveTo, ctx);
      assert.alwaysCalledWithExactly(ctx.moveTo, 100, -100);

      assert.calledOnce(ctx.stroke);
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

      const edge = new StraightEdge(
        {
          id: "E",
          from: 1,
          to: 3,
        },
        body as any,
        {} as any
      );

      edge.drawLine(ctx as any, { dashes: [1, 2, 3] } as any, false, false);

      assert.calledOnce(ctx.beginPath);
      assert.alwaysCalledOn(ctx.beginPath, ctx);

      assert.callCount(ctx.lineTo, 71);
      assert.alwaysCalledOn(ctx.lineTo, ctx);

      assert.callCount(ctx.moveTo, 72);
      assert.alwaysCalledOn(ctx.moveTo, ctx);

      assert.calledOnce(ctx.stroke);
      assert.alwaysCalledOn(ctx.stroke, ctx);
      assert.alwaysCalledWithExactly(ctx.stroke);
    });
  });

  it("getViaNode", function (): void {
    const edge = new StraightEdge(
      {
        id: "E",
        from: 1,
        to: 3,
      },
      body as any,
      {} as any
    );

    expect(edge.getViaNode()).to.be.undefined;
  });

  it("getPoint", function (): void {
    const edge = new StraightEdge(
      {
        id: "E",
        from: 1,
        to: 3,
      },
      body as any,
      {} as any
    );

    expect(edge.getPoint(0.5)).to.deep.equal({
      x: 200,
      y: -200,
    });
  });

  describe("findBorderPosition", function (): void {
    it("2 nodes", function (): void {
      const ctx = {};

      const node = {
        ...body.nodes[5],
        distanceToBorder: stub(),
      };
      node.distanceToBorder.onFirstCall().returns(Math.PI);
      node.distanceToBorder.throws();

      const edge = new StraightEdge(
        {
          id: "E",
          from: 1,
          to: 3,
        },
        body as any,
        {} as any
      );

      const { x, y } = edge._findBorderPosition(node, ctx);

      expect(x, "x").to.be.closeTo(297.8, 0.5);
      expect(y, "y").to.be.closeTo(-297.8, 0.5);
    });

    it("from node", function (): void {
      const ctx = {};

      const node = {
        ...body.nodes[1],
        distanceToBorder: stub(),
      };
      node.distanceToBorder.onFirstCall().returns(Math.PI);
      node.distanceToBorder.throws();

      const edge = new StraightEdge(
        {
          id: "E",
          from: 1,
          to: 3,
        },
        body as any,
        {} as any
      );

      const { x, y } = edge._findBorderPosition(node, ctx);

      expect(x, "x").to.be.closeTo(102.2, 0.5);
      expect(y, "y").to.be.closeTo(-102.2, 0.5);
    });

    it("to node", function (): void {
      const ctx = {};

      const node = {
        ...body.nodes[3],
        distanceToBorder: stub(),
      };
      node.distanceToBorder.onFirstCall().returns(Math.PI);
      node.distanceToBorder.throws();

      const edge = new StraightEdge(
        {
          id: "E",
          from: 1,
          to: 3,
        },
        body as any,
        {} as any
      );

      const { x, y } = edge._findBorderPosition(node, ctx);

      expect(x, "x").to.be.closeTo(297.8, 0.5);
      expect(y, "y").to.be.closeTo(-297.8, 0.5);
    });
  });

  it("_getDistanceToEdge", function (): void {
    const edge = new StraightEdge(
      {
        id: "E",
        from: 1,
        to: 3,
      },
      body as any,
      {} as any
    );

    expect(edge._getDistanceToEdge(10, -10, 20, -20, 10, 20)).to.equal(30);
  });
});
