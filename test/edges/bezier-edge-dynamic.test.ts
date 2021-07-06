import { expect } from "chai";
import { assert, spy, stub } from "sinon";
import { deepFreeze } from "../helpers";
import { body, mockedBody } from "./helpers";

import { BezierEdgeDynamic } from "../../lib/network/modules/components/edges";

describe("BezierEdgeDynamic", function (): void {
  describe("constructor", function (): void {
    it("existing nodes", function (): void {
      const body = mockedBody();

      const options = deepFreeze({
        id: "E",
        from: 1,
        to: 3,
        smooth: {
          roundness: 2,
        },
      });

      const edge = new BezierEdgeDynamic(options, body, {} as any);

      expect(edge).to.have.ownProperty("options").that.equals(options);
      expect(edge).to.have.ownProperty("from").that.equals(body.nodes[1]);
      expect(edge).to.have.ownProperty("to").that.equals(body.nodes[3]);
      expect(edge).to.have.ownProperty("id").that.equals("E");
    });

    it("invalid node", function (): void {
      const body = mockedBody();

      const edge = new BezierEdgeDynamic(
        {
          id: "E",
          from: 1,
          to: null,
          smooth: {
            roundness: 2,
          },
        },
        body,
        {} as any
      );

      expect(edge.via).to.deep.include({
        x: 0,
        y: 0,
      });
    });
  });

  it("cleanup", function (): void {
    const body = mockedBody();

    const options = deepFreeze({
      id: "E",
      from: 1,
      to: 3,
      smooth: {
        roundness: 2,
      },
    });

    const edge = new BezierEdgeDynamic(options, body, {} as any);
    const cleanupRet = edge.cleanup();

    expect(cleanupRet).to.be.true;

    assert.calledOnce(body.emitter.on);
    assert.alwaysCalledWith(body.emitter.on, "_repositionBezierNodes");

    assert.calledOnce(body.emitter.off);
    assert.alwaysCalledWith(body.emitter.off, "_repositionBezierNodes");
  });

  describe("drawLine", function (): void {
    it("solid", function (): void {
      const body = mockedBody();

      const ctx = {
        beginPath: spy(),
        moveTo: spy(),
        quadraticCurveTo: spy(),
        setLineDash: spy(),
        stroke: spy(),
      };

      const edge = new BezierEdgeDynamic(
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

      edge.drawLine(
        ctx,
        { dashes: false, backgroundDashes: false },
        false,
        false,
        body.nodes[2]
      );

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

      assert.calledTwice(ctx.setLineDash);
      assert.alwaysCalledOn(ctx.setLineDash, ctx);
      assert.alwaysCalledWithExactly(ctx.setLineDash, []);

      assert.calledTwice(ctx.stroke);
      assert.alwaysCalledOn(ctx.stroke, ctx);
      assert.alwaysCalledWithExactly(ctx.stroke);
    });

    it("dashed", function (): void {
      const body = mockedBody();

      const ctx = {
        beginPath: spy(),
        lineTo: spy(),
        moveTo: spy(),
        stroke: spy(),
      };

      const edge = new BezierEdgeDynamic(
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

  it("getViaNode", function (): void {
    const body = mockedBody();

    const edge = new BezierEdgeDynamic(
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

    const { x, y } = edge.getViaNode();

    expect(x, "x").to.be.closeTo(200, 0.5);
    expect(y, "y").to.be.closeTo(-200, 0.5);
  });

  describe("getPoint", function (): void {
    it("two points", function (): void {
      const body = mockedBody();

      const edge = new BezierEdgeDynamic(
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

      expect(edge.getPoint(0.5)).to.deep.equal({
        x: 200,
        y: -200,
      });
    });

    it("single point", function (): void {
      const body = mockedBody();

      const edge = new BezierEdgeDynamic(
        {
          id: "E",
          from: 4,
          to: 4,
          smooth: {
            roundness: 2,
          },
          selfReference: {
            size: 2,
            angle: Math.PI / 2,
            renderBehindTheNode: true,
          },
        },
        body,
        {} as any
      );

      expect(edge.getPoint(0.5)).to.deep.equal({
        x: 400,
        y: -846,
      });
    });
  });

  describe("findBorderPosition", function (): void {
    it("2 nodes", function (): void {
      const body = mockedBody();

      const edge = new BezierEdgeDynamic(
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
      expect(y, "y").to.be.closeTo(-100, 0.5);
    });

    it("from node", function (): void {
      const body = mockedBody();

      const edge = new BezierEdgeDynamic(
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

      expect(x, "x").to.be.closeTo(178.5, 0.5);
      expect(y, "y").to.be.closeTo(-178.5, 0.5);
    });

    it("to node", function (): void {
      const body = mockedBody();

      const edge = new BezierEdgeDynamic(
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
      expect(y, "y").to.be.closeTo(-100, 0.5);
    });
  });

  it("_getDistanceToEdge", function (): void {
    const body = mockedBody();

    const edge = new BezierEdgeDynamic(
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

    expect(edge._getDistanceToEdge(10, -10, 20, -20, 10, 20)).to.equal(30);
  });
});
