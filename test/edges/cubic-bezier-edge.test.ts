import { expect } from "chai";
import { assert, spy, stub } from "sinon";
import { deepFreeze } from "../helpers";
import { body, mockedBody } from "./helpers";

import { CubicBezierEdge } from "../../lib/network/modules/components/edges";

describe("CubicBezierEdge", function (): void {
  it("constructor", function (): void {
    const options = deepFreeze({
      id: "E",
      from: 1,
      to: 3,
      smooth: {
        roundness: 2,
      },
    });

    const edge = new CubicBezierEdge(options, body as any, {} as any);

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

      const edge = new CubicBezierEdge(
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

      assert.calledOnce(ctx.lineTo);
      assert.alwaysCalledOn(ctx.lineTo, ctx);
      assert.alwaysCalledWithExactly(ctx.lineTo, 300, -300);

      assert.calledOnce(ctx.moveTo);
      assert.alwaysCalledOn(ctx.moveTo, ctx);
      assert.alwaysCalledWithExactly(ctx.moveTo, 100, -100);

      assert.calledTwice(ctx.stroke);
      assert.alwaysCalledOn(ctx.stroke, ctx);
      assert.alwaysCalledWithExactly(ctx.stroke);
    });

    it("dashed", function (): void {
      const ctx = {
        beginPath: spy(),
        lineTo: spy(),
        moveTo: spy(),
        restore: spy(),
        save: spy(),
        setLineDash: spy(),
        stroke: spy(),
      };

      const edge = new CubicBezierEdge(
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

      edge.drawLine(ctx, { dashes: [1, 2, 3] }, false, false, body.nodes[2]);

      assert.calledOnce(ctx.beginPath);
      assert.alwaysCalledOn(ctx.beginPath, ctx);
      assert.alwaysCalledWithExactly(ctx.beginPath);

      assert.calledOnce(ctx.lineTo);
      assert.alwaysCalledOn(ctx.lineTo, ctx);
      assert.alwaysCalledWithExactly(ctx.lineTo, 300, -300);

      assert.calledOnce(ctx.moveTo);
      assert.alwaysCalledOn(ctx.moveTo, ctx);
      assert.alwaysCalledWithExactly(ctx.moveTo, 100, -100);

      assert.calledOnce(ctx.restore);
      assert.alwaysCalledOn(ctx.restore, ctx);
      assert.alwaysCalledWithExactly(ctx.restore);

      assert.calledOnce(ctx.save);
      assert.alwaysCalledOn(ctx.save, ctx);
      assert.alwaysCalledWithExactly(ctx.save);

      assert.callCount(ctx.setLineDash, 4);
      assert.alwaysCalledOn(ctx.setLineDash, ctx);
      assert.calledWithExactly(ctx.setLineDash.getCall(0), [1, 2, 3]);
      assert.calledWithExactly(ctx.setLineDash.getCall(1), [5, 5]);
      assert.calledWithExactly(ctx.setLineDash.getCall(2), [1, 2, 3]);
      assert.calledWithExactly(ctx.setLineDash.getCall(3), [0]);

      assert.calledTwice(ctx.stroke);
      assert.alwaysCalledOn(ctx.stroke, ctx);
      assert.alwaysCalledWithExactly(ctx.stroke);
    });

    it("same node", function (): void {
      const ctx = {
        arc: spy(),
        beginPath: spy(),
        stroke: spy(),
      };

      const edge = new CubicBezierEdge(
        {
          id: "E",
          from: 4,
          to: 4,
          smooth: {
            roundness: 2,
          },
          selfReference: {
            size: 42,
            angle: Math.PI / 2,
            renderBehindTheNode: true,
          },
        },
        body as any,
        {} as any
      );

      edge.drawLine(ctx, { dashes: false }, false, false, body.nodes[2]);

      assert.calledOnce(ctx.arc);
      assert.alwaysCalledOn(ctx.arc, ctx);
      assert.alwaysCalledWithExactly(
        ctx.arc,
        421,
        -442,
        42,
        0,
        6.283185307179586,
        false
      );

      assert.calledOnce(ctx.beginPath);
      assert.alwaysCalledOn(ctx.beginPath, ctx);
      assert.alwaysCalledWithExactly(ctx.beginPath);

      assert.calledOnce(ctx.stroke);
      assert.alwaysCalledOn(ctx.stroke, ctx);
      assert.alwaysCalledWithExactly(ctx.stroke);
    });
  });

  describe("getViaNode", function (): void {
    it("no forced direction", function (): void {
      const edge = new CubicBezierEdge(
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

      const viaNode = edge.getViaNode();

      expect(viaNode).to.be.an("array");
      expect(viaNode).to.deep.equal([
        {
          x: 100,
          y: -500,
        },
        {
          x: 300,
          y: 100,
        },
      ]);
    });

    it("horizontal forced direction", function (): void {
      const edge = new CubicBezierEdge(
        {
          id: "E",
          from: 1,
          to: 3,
          smooth: {
            forceDirection: "horizontal",
            roundness: 2,
          },
        },
        body as any,
        {} as any
      );

      const viaNode = edge.getViaNode();

      expect(viaNode).to.be.an("array");
      expect(viaNode).to.deep.equal([
        {
          x: 500,
          y: -100,
        },
        {
          x: -100,
          y: -300,
        },
      ]);
    });
  });

  it("getPoint", function (): void {
    const edge = new CubicBezierEdge(
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
      x: 200,
      y: -200,
    });
  });

  describe("findBorderPosition", function (): void {
    it("2 nodes", function (): void {
      const body = mockedBody();

      const edge = new CubicBezierEdge(
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

      const edge = new CubicBezierEdge(
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

      expect(x, "x").to.be.closeTo(109.5, 0.5);
      expect(y, "y").to.be.closeTo(-210.5, 0.5);
    });

    it("to node", function (): void {
      const body = mockedBody();

      const edge = new CubicBezierEdge(
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
    const edge = new CubicBezierEdge(
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

  describe("getColor", function (): void {
    it("default", function (): void {
      const body = mockedBody();
      const ctx = {};
      const values = { opacity: 0.5 };

      const edge = new CubicBezierEdge(
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

      expect(edge.getColor(ctx, values, false, false)).to.equal(
        "rgba(0,0,17,0.5)"
      );
    });

    it("inherits from", function (): void {
      const body = mockedBody();
      const ctx = {};
      const values = { opacity: 0.5, inheritsColor: "from" };

      const edge = new CubicBezierEdge(
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

      expect(edge.getColor(ctx, values, false, false)).to.equal(
        "rgba(0,0,17,0.5)"
      );
    });

    it("inherits to", function (): void {
      const body = mockedBody();
      const ctx = {};
      const values = { opacity: 0.5, inheritsColor: "to" };

      const edge = new CubicBezierEdge(
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

      expect(edge.getColor(ctx, values, false, false)).to.equal(
        "rgba(0,0,49,0.5)"
      );
    });

    it("inherits both", function (): void {
      const body = mockedBody();
      const adsklgh = {
        addColorStop: spy(),
      };
      const ctx = {
        createLinearGradient: stub(),
      };
      ctx.createLinearGradient.returns(adsklgh);
      const values = { opacity: 0.5, inheritsColor: "both" };

      const edge = new CubicBezierEdge(
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

      expect(edge.getColor(ctx, values, false, false)).to.equal(adsklgh);
      assert.calledTwice(adsklgh.addColorStop);
      assert.calledWithExactly(adsklgh.addColorStop.getCall(0), 0, "#000013");
      assert.calledWithExactly(adsklgh.addColorStop.getCall(1), 1, "#000033");
    });
  });

  describe("getLineWidth", function (): void {
    [
      { selected: false, hover: false, expected: 3 },
      { selected: true, hover: false, expected: 2 },
      { selected: false, hover: true, expected: 1.5 },
      { selected: true, hover: true, expected: 2 },
    ].forEach(({ selected, hover, expected }): void => {
      it(JSON.stringify({ selected, hover }), function (): void {
        const body = mockedBody();

        const edge = new CubicBezierEdge(
          {
            id: "E",
            from: 1,
            to: 3,
            smooth: {
              roundness: 2,
            },
            width: 3,
          },
          body,
          {} as any
        );

        expect(edge.getLineWidth(selected, hover)).to.equal(expected);
      });
    });
  });

  describe("findBorderPositions", function (): void {
    [
      {
        from: 1,
        to: 3,
        expected: {
          from: {
            t: 0.1318359375,
            x: 109.51186753809452,
            y: -210.6437873095274,
          },
          to: {
            t: 0.0009765625,
            x: 100.00057183206081,
            y: -101.16901583969593,
          },
        },
      },
      {
        from: 3,
        to: 1,
        expected: {
          from: {
            t: 0.9990234375,
            x: 100.00057183206081,
            y: -101.16901583969593,
          },
          to: {
            t: 0.8681640625,
            x: 109.51186753809452,
            y: -210.6437873095274,
          },
        },
      },
      {
        from: 4,
        to: 4,
        expected: {
          from: {
            t: 0.5077148437499999,
            x: 358.049334219333,
            y: -841.9648978996685,
          },
          to: {
            t: 0.7998046875,
            x: 412.92968488174444,
            y: -804.0397291193017,
          },
        },
      },
    ].forEach(({ from, to, expected }): void => {
      it(`${from} → ${to}`, function (): void {
        const body = mockedBody();
        const ctx = {};

        const edge = new CubicBezierEdge(
          {
            id: "E",
            from,
            to,
            smooth: {
              roundness: 2,
            },
            selfReference: {
              size: 42,
              angle: Math.PI / 2,
              renderBehindTheNode: true,
            },
          },
          body,
          {} as any
        );

        expect(edge.findBorderPositions(ctx)).to.deep.equal(expected);
      });
    });
  });

  describe("getArrowData", function (): void {
    [
      {
        from: 4,
        to: 4,
        smooth: true,
        values: {
          width: 0.5,
          fromArrowScale: 2,
          fromArrowType: "arrow",
        },
        position: "from",
        expected: {
          angle: -16.968019374652727,
          core: {
            x: 395.6684709042148,
            y: -870.9478000797577,
          },
          length: 31.5,
          point: {
            t: 3.5005441579550327,
            x: 387.0000759840845,
            y: -843.9555524981157,
          },
          type: "arrow",
        },
      },
      {
        from: 4,
        to: 4,
        smooth: false,
        values: {
          width: 1,
          middleArrowScale: 2,
          middleArrowType: "bar",
        },
        position: "middle",
        expected: {
          angle: 3.4557519189487724,
          core: {
            x: 428.24637853396604,
            y: -847.8221952670641,
          },
          length: 33,
          point: {
            x: 400,
            y: -857,
          },
          type: "bar",
        },
      },
      {
        from: 4,
        to: 4,
        smooth: false,
        values: {
          width: 2,
          toArrowScale: 2,
          toArrowType: "circle",
        },
        position: "to",
        expected: {
          angle: -11.292410721980435,
          core: {
            x: 403.521164116054,
            y: -874.757852447893,
          },
          length: 36,
          point: {
            t: 1.997242985827105,
            x: 412.9980495257085,
            y: -843.7748144604348,
          },
          type: "circle",
        },
      },
      {
        from: 3,
        to: 1,
        smooth: true,
        values: {
          width: 3,
          fromArrowScale: 2,
          fromArrowType: "bar",
        },
        position: "from",
        expected: {
          angle: -1.6364976403834781,
          core: {
            x: 102.30502917621531,
            y: -66.14474602076933,
          },
          length: 39,
          point: {
            t: 0.9990234375,
            x: 100.00057183206081,
            y: -101.16901583969593,
          },
          type: "bar",
        },
      },
      {
        from: 1,
        to: 3,
        smooth: false,
        values: {
          width: 3,
          fromArrowScale: 2,
          fromArrowType: "circle",
        },
        position: "from",
        expected: {
          angle: 2.356194490192345,
          core: {
            x: 134.33131555774233,
            y: -235.46323532917523,
          },
          length: 39,
          point: {
            t: 0.1318359375,
            x: 109.51186753809452,
            y: -210.6437873095274,
          },
          type: "circle",
        },
      },
      {
        from: 1,
        to: 3,
        smooth: false,
        values: {
          width: 4,
          middleArrowScale: 2,
          middleArrowType: "arrow",
        },
        position: "middle",
        expected: {
          angle: -1.5641601175223843,
          core: {
            x: 199.74915313069414,
            y: -49.70083233921467,
          },
          length: 42,
          point: {
            x: 200,
            y: -87.5,
          },
          type: "arrow",
        },
      },
      {
        from: 1,
        to: 3,
        smooth: true,
        values: {
          width: 5,
          toArrowScale: 2,
          toArrowType: "bar",
        },
        position: "to",
        expected: {
          angle: 1.139998993005742,
          core: {
            x: 83.08795736471299,
            y: -137.9686554015022,
          },
          length: 45,
          point: {
            t: 0.0009765625,
            x: 100.00057183206081,
            y: -101.16901583969593,
          },
          type: "bar",
        },
      },
    ].forEach(({ from, to, smooth, values, position, expected }): void => {
      it(
        JSON.stringify({ from, to, smooth, values, position }),
        function (): void {
          const body = mockedBody();
          const ctx = {};

          const viaNode = [body.nodes.O, body.nodes.T];
          const selected = true;
          const hover = true;

          const edge = new CubicBezierEdge(
            {
              id: "E",
              from,
              to,
              smooth: {
                enabled: smooth,
                roundness: 2,
              },
              selfReference: {
                size: 13,
                angle: Math.PI / 2,
                renderBehindTheNode: true,
              },
            },
            body,
            {} as any
          );

          expect(
            edge.getArrowData(ctx, position, viaNode, selected, hover, values)
          ).to.deep.equal(expected);
        }
      );
    });
  });
});
