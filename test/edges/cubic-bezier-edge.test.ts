import { expect } from 'chai'
import { assert, spy, stub } from 'sinon'
import { deepFreeze } from '../helpers'
import { body, mockedBody } from './helpers'

import CubicBezierEdge from '../../lib/network/modules/components/edges/CubicBezierEdge'

describe('CubicBezierEdge', function(): void {
  it('constructor', function(): void {
    const options = deepFreeze({
      id: 'E',
      from: 1,
      to: 3,
      smooth: {
        roundness: 2,
      },
    })

    const edge = new CubicBezierEdge(options, body as any, {} as any)

    expect(edge)
      .to.have.ownProperty('options')
      .that.equals(options)
    expect(edge)
      .to.have.ownProperty('from')
      .that.equals(body.nodes[1])
    expect(edge)
      .to.have.ownProperty('to')
      .that.equals(body.nodes[3])
    expect(edge)
      .to.have.ownProperty('id')
      .that.equals('E')
  })

  describe('drawLine', function(): void {
    it('solid', function(): void {
      const ctx = {
        beginPath: spy(),
        lineTo: spy(),
        moveTo: spy(),
        stroke: spy(),
      }

      const edge = new CubicBezierEdge(
        {
          id: 'E',
          from: 1,
          to: 3,
          smooth: {
            roundness: 2,
          },
        },
        body as any,
        {} as any
      )

      edge.drawLine(ctx, { dashes: false }, false, false, body.nodes[2])

      assert.calledOnce(ctx.beginPath)
      assert.alwaysCalledOn(ctx.beginPath, ctx)
      assert.alwaysCalledWithExactly(ctx.beginPath)

      assert.calledOnce(ctx.lineTo)
      assert.alwaysCalledOn(ctx.lineTo, ctx)
      assert.alwaysCalledWithExactly(ctx.lineTo, 300, -300)

      assert.calledOnce(ctx.moveTo)
      assert.alwaysCalledOn(ctx.moveTo, ctx)
      assert.alwaysCalledWithExactly(ctx.moveTo, 100, -100)

      assert.calledTwice(ctx.stroke)
      assert.alwaysCalledOn(ctx.stroke, ctx)
      assert.alwaysCalledWithExactly(ctx.stroke)
    })

    it('dashed', function(): void {
      const ctx = {
        beginPath: spy(),
        lineTo: spy(),
        moveTo: spy(),
        restore: spy(),
        save: spy(),
        setLineDash: spy(),
        stroke: spy(),
      }

      const edge = new CubicBezierEdge(
        {
          id: 'E',
          from: 1,
          to: 3,
          smooth: {
            roundness: 2,
          },
        },
        body as any,
        {} as any
      )

      edge.drawLine(ctx, { dashes: [1, 2, 3] }, false, false, body.nodes[2])

      assert.calledOnce(ctx.beginPath)
      assert.alwaysCalledOn(ctx.beginPath, ctx)
      assert.alwaysCalledWithExactly(ctx.beginPath)

      assert.calledOnce(ctx.lineTo)
      assert.alwaysCalledOn(ctx.lineTo, ctx)
      assert.alwaysCalledWithExactly(ctx.lineTo, 300, -300)

      assert.calledOnce(ctx.moveTo)
      assert.alwaysCalledOn(ctx.moveTo, ctx)
      assert.alwaysCalledWithExactly(ctx.moveTo, 100, -100)

      assert.calledOnce(ctx.restore)
      assert.alwaysCalledOn(ctx.restore, ctx)
      assert.alwaysCalledWithExactly(ctx.restore)

      assert.calledOnce(ctx.save)
      assert.alwaysCalledOn(ctx.save, ctx)
      assert.alwaysCalledWithExactly(ctx.save)

      assert.callCount(ctx.setLineDash, 4)
      assert.alwaysCalledOn(ctx.setLineDash, ctx)
      assert.calledWithExactly(ctx.setLineDash.getCall(0), [1, 2, 3])
      assert.calledWithExactly(ctx.setLineDash.getCall(1), [5, 5])
      assert.calledWithExactly(ctx.setLineDash.getCall(2), [1, 2, 3])
      assert.calledWithExactly(ctx.setLineDash.getCall(3), [0])

      assert.calledTwice(ctx.stroke)
      assert.alwaysCalledOn(ctx.stroke, ctx)
      assert.alwaysCalledWithExactly(ctx.stroke)
    })

    it('same node', function(): void {
      const ctx = {
        arc: spy(),
        beginPath: spy(),
        stroke: spy(),
      }

      const edge = new CubicBezierEdge(
        {
          id: 'E',
          from: 4,
          to: 4,
          smooth: {
            roundness: 2,
          },
          selfReferenceSize: 42,
        },
        body as any,
        {} as any
      )

      edge.drawLine(ctx, { dashes: false }, false, false, body.nodes[2])

      assert.calledOnce(ctx.arc)
      assert.alwaysCalledOn(ctx.arc, ctx)
      assert.alwaysCalledWithExactly(
        ctx.arc,
        421,
        -442,
        42,
        0,
        6.283185307179586,
        false
      )

      assert.calledOnce(ctx.beginPath)
      assert.alwaysCalledOn(ctx.beginPath, ctx)
      assert.alwaysCalledWithExactly(ctx.beginPath)

      assert.calledOnce(ctx.stroke)
      assert.alwaysCalledOn(ctx.stroke, ctx)
      assert.alwaysCalledWithExactly(ctx.stroke)
    })
  })

  describe('getViaNode', function(): void {
    it('no forced direction', function(): void {
      const edge = new CubicBezierEdge(
        {
          id: 'E',
          from: 1,
          to: 3,
          smooth: {
            roundness: 2,
          },
        },
        body as any,
        {} as any
      )

      const viaNode = edge.getViaNode()

      expect(viaNode).to.be.an('array')
      expect(viaNode).to.deep.equal([
        {
          x: 100,
          y: -500,
        },
        {
          x: 300,
          y: 100,
        },
      ])
    })

    it('horizontal forced direction', function(): void {
      const edge = new CubicBezierEdge(
        {
          id: 'E',
          from: 1,
          to: 3,
          smooth: {
            forceDirection: 'horizontal',
            roundness: 2,
          },
        },
        body as any,
        {} as any
      )

      const viaNode = edge.getViaNode()

      expect(viaNode).to.be.an('array')
      expect(viaNode).to.deep.equal([
        {
          x: 500,
          y: -100,
        },
        {
          x: -100,
          y: -300,
        },
      ])
    })
  })

  it('getPoint', function(): void {
    const edge = new CubicBezierEdge(
      {
        id: 'E',
        from: 1,
        to: 3,
        smooth: {
          roundness: 2,
        },
      },
      body as any,
      {} as any
    )

    expect(edge.getPoint(0.5)).to.deep.equal({
      x: 200,
      y: -200,
    })
  })

  describe('findBorderPosition', function(): void {
    it('2 nodes', function(): void {
      const body = mockedBody()

      const edge = new CubicBezierEdge(
        {
          id: 'E',
          from: 1,
          to: 3,
          smooth: {
            roundness: 2,
          },
        },
        body,
        {} as any
      )

      const { x, y } = edge._findBorderPosition(body.nodes.O, null)

      expect(x, 'x').to.be.closeTo(100, 0.5)
      expect(y, 'y').to.be.closeTo(-101, 0.5)
    })

    it('from node', function(): void {
      const body = mockedBody()

      const edge = new CubicBezierEdge(
        {
          id: 'E',
          from: 1,
          to: 3,
          smooth: {
            roundness: 2,
          },
        },
        body,
        {} as any
      )

      const { x, y } = edge._findBorderPosition(body.nodes[1], null)

      expect(x, 'x').to.be.closeTo(109.5, 0.5)
      expect(y, 'y').to.be.closeTo(-210.5, 0.5)
    })

    it('to node', function(): void {
      const body = mockedBody()

      const edge = new CubicBezierEdge(
        {
          id: 'E',
          from: 1,
          to: 3,
          smooth: {
            roundness: 2,
          },
        },
        body,
        {} as any
      )

      const { x, y } = edge._findBorderPosition(body.nodes[3], null)

      expect(x, 'x').to.be.closeTo(100, 0.5)
      expect(y, 'y').to.be.closeTo(-101, 0.5)
    })
  })

  it('_getDistanceToEdge', function(): void {
    const edge = new CubicBezierEdge(
      {
        id: 'E',
        from: 1,
        to: 3,
        smooth: {
          roundness: 2,
        },
      },
      body as any,
      {} as any
    )

    expect(edge._getDistanceToEdge(10, -10, 20, -20, 10, 20)).to.equal(30)
  })

  describe('getColor', function(): void {
    it('default', function(): void {
      const body = mockedBody()
      const ctx = {}
      const values = { opacity: 0.5 }

      const edge = new CubicBezierEdge(
        {
          id: 'E',
          from: 1,
          to: 3,
          smooth: {
            roundness: 2,
          },
        },
        body,
        {} as any
      )

      expect(edge.getColor(ctx, values, false, false)).to.equal(
        'rgba(0,0,17,0.5)'
      )
    })

    it('inherits from', function(): void {
      const body = mockedBody()
      const ctx = {}
      const values = { opacity: 0.5, inheritsColor: 'from' }

      const edge = new CubicBezierEdge(
        {
          id: 'E',
          from: 1,
          to: 3,
          smooth: {
            roundness: 2,
          },
        },
        body,
        {} as any
      )

      expect(edge.getColor(ctx, values, false, false)).to.equal(
        'rgba(0,0,17,0.5)'
      )
    })

    it('inherits to', function(): void {
      const body = mockedBody()
      const ctx = {}
      const values = { opacity: 0.5, inheritsColor: 'to' }

      const edge = new CubicBezierEdge(
        {
          id: 'E',
          from: 1,
          to: 3,
          smooth: {
            roundness: 2,
          },
        },
        body,
        {} as any
      )

      expect(edge.getColor(ctx, values, false, false)).to.equal(
        'rgba(0,0,49,0.5)'
      )
    })

    it('inherits both', function(): void {
      const body = mockedBody()
      const adsklgh = {
        addColorStop: spy(),
      }
      const ctx = {
        createLinearGradient: stub(),
      }
      ctx.createLinearGradient.returns(adsklgh)
      const values = { opacity: 0.5, inheritsColor: 'both' }

      const edge = new CubicBezierEdge(
        {
          id: 'E',
          from: 1,
          to: 3,
          smooth: {
            roundness: 2,
          },
        },
        body,
        {} as any
      )

      expect(edge.getColor(ctx, values, false, false)).to.equal(adsklgh)
      assert.calledTwice(adsklgh.addColorStop)
      assert.calledWithExactly(adsklgh.addColorStop.getCall(0), 0, '#000013')
      assert.calledWithExactly(adsklgh.addColorStop.getCall(1), 1, '#000033')
    })
  })

  describe('getLineWidth', function(): void {
    ;[
      { selected: false, hover: false, expected: 3 },
      { selected: true, hover: false, expected: 2 },
      { selected: false, hover: true, expected: 1.5 },
      { selected: true, hover: true, expected: 2 },
    ].forEach(({ selected, hover, expected }): void => {
      it(JSON.stringify({ selected, hover }), function(): void {
        const body = mockedBody()

        const edge = new CubicBezierEdge(
          {
            id: 'E',
            from: 1,
            to: 3,
            smooth: {
              roundness: 2,
            },
            width: 3,
          },
          body,
          {} as any
        )

        expect(edge.getLineWidth(selected, hover)).to.equal(expected)
      })
    })
  })

  describe('findBorderPositions', function(): void {
    ;[
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
            t: 0.250341796875,
            x: 420.9098019990056,
            y: -483.99990314656236,
          },
          to: {
            t: 0.7998046875,
            x: 433.92968488174444,
            y: -402.0397291193016,
          },
        },
      },
    ].forEach(({ from, to, expected }): void => {
      it(`${from} → ${to}`, function(): void {
        const body = mockedBody()
        const ctx = {}

        const edge = new CubicBezierEdge(
          {
            id: 'E',
            from,
            to,
            smooth: {
              roundness: 2,
            },
            selfReferenceSize: 42,
          },
          body,
          {} as any
        )

        expect(edge.findBorderPositions(ctx)).to.deep.equal(expected)
      })
    })
  })

  describe('getArrowData', function(): void {
    ;[
      {
        from: 4,
        to: 4,
        smooth: true,
        values: {
          width: 0.5,
          fromArrowScale: 2,
          fromArrowType: 'arrow',
        },
        position: 'from',
        expected: {
          angle: 3.4536043458457324,
          core: {
            x: 447.9532857144876,
            y: -417.2972622260487,
          },
          length: 31.5,
          point: {
            t: 0.250341796875,
            x: 420.9720815711208,
            y: -425.999970021555,
          },
          type: 'arrow',
        },
      },
      {
        from: 4,
        to: 4,
        smooth: false,
        values: {
          width: 1,
          middleArrowScale: 2,
          middleArrowType: 'bar',
        },
        position: 'middle',
        expected: {
          angle: 3.9269908169872414,
          core: {
            x: 447.9029478978546,
            y: -403.58201341320836,
          },
          length: 33,
          point: {
            x: 426.90187649661414,
            y: -424.5830848144488,
          },
          type: 'bar',
        },
      },
      {
        from: 4,
        to: 4,
        smooth: false,
        values: {
          width: 2,
          toArrowScale: 2,
          toArrowType: 'circle',
        },
        position: 'to',
        expected: {
          angle: -5.024093876483052,
          core: {
            x: 424.06346980869967,
            y: -443.80680503833094,
          },
          length: 36,
          point: {
            t: 0.999609375,
            x: 433.99996084448463,
            y: -412.96809323164604,
          },
          type: 'circle',
        },
      },
      {
        from: 3,
        to: 1,
        smooth: true,
        values: {
          width: 3,
          fromArrowScale: 2,
          fromArrowType: 'bar',
        },
        position: 'from',
        expected: {
          angle: -1.5703071700223465,
          core: {
            x: 99.983402430029,
            y: -66.06902003896066,
          },
          length: 39,
          point: {
            t: 0.9990234375,
            x: 100.00057183206081,
            y: -101.16901583969593,
          },
          type: 'bar',
        },
      },
      {
        from: 1,
        to: 3,
        smooth: false,
        values: {
          width: 3,
          fromArrowScale: 2,
          fromArrowType: 'circle',
        },
        position: 'from',
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
          type: 'circle',
        },
      },
      {
        from: 1,
        to: 3,
        smooth: false,
        values: {
          width: 4,
          middleArrowScale: 2,
          middleArrowType: 'arrow',
        },
        position: 'middle',
        expected: {
          angle: -0.7853981633974483,
          core: {
            x: 173.2713636711485,
            y: -60.77136367114851,
          },
          length: 42,
          point: {
            x: 200,
            y: -87.5,
          },
          type: 'arrow',
        },
      },
      {
        from: 1,
        to: 3,
        smooth: true,
        values: {
          width: 5,
          toArrowScale: 2,
          toArrowType: 'bar',
        },
        position: 'to',
        expected: {
          angle: -1.5703071700223465,
          core: {
            x: 99.98076098356258,
            y: -60.669020685001385,
          },
          length: 45,
          point: {
            t: 0.0009765625,
            x: 100.00057183206081,
            y: -101.16901583969593,
          },
          type: 'bar',
        },
      },
    ].forEach(({ from, to, smooth, values, position, expected }): void => {
      it(
        JSON.stringify({ from, to, smooth, values, position }),
        function(): void {
          const body = mockedBody()
          const ctx = {}

          const viaNode = [body.nodes.O, body.nodes.T]
          const selected = true
          const hover = true

          const edge = new CubicBezierEdge(
            {
              id: 'E',
              from,
              to,
              smooth: {
                enabled: smooth,
                roundness: 2,
              },
              selfReferenceSize: 13,
            },
            body,
            {} as any
          )

          expect(
            edge.getArrowData(ctx, position, viaNode, selected, hover, values)
          ).to.deep.equal(expected)
        }
      )
    })
  })
})
