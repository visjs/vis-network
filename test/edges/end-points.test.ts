import { expect } from "chai";
import { spy } from "sinon";

import { EndPoints } from "../../lib/network/modules/components/edges";

describe("EndPoints", function (): void {
  describe("methods called", function (): void {
    [
      {
        type: "circle",
        methods: {
          beginPath: [[]],
          closePath: [[]],
          arc: [
            [
              35.60100282465478,
              -37.113292320674645,
              6.4,
              0,
              6.283185307179586,
              false,
            ],
          ],
        },
      },
      {
        type: "box",
        methods: {
          beginPath: [[]],
          closePath: [[]],
          lineTo: [[42.084969240505984, -41.79924788150892]],
          moveTo: [[41.915030759494016, -32.20075211849108]],
        },
      },
      {
        type: "crow",
        methods: {
          beginPath: [[]],
          closePath: [[]],
          lineTo: [[41.915030759494016, -32.20075211849108]],
          moveTo: [[26.00250706163694, -37.28323080168662]],
        },
      },
      {
        type: "curve",
        methods: {
          arc: [
            [
              35.60100282465478,
              -37.113292320674645,
              6.4,
              42.4292036732051,
              45.5707963267949,
              false,
            ],
          ],
          beginPath: [[]],
          stroke: [[]],
        },
      },
      {
        type: "inv_curve",
        methods: {
          arc: [
            [
              37.20075211849108,
              -37.084969240505984,
              6.4,
              45.5707963267949,
              48.71238898038469,
              false,
            ],
          ],
          beginPath: [[]],
          stroke: [[]],
        },
      },
      {
        type: "diamond",
        methods: {
          beginPath: [[]],
          closePath: [[]],
          lineTo: [[34.08622277132446, -41.940863282352225]],
          moveTo: [[42, -37]],
        },
      },
      {
        type: "triangle",
        methods: {
          beginPath: [[]],
          closePath: [[]],
          lineTo: [[25.917537821130956, -32.4839829201777]],
          moveTo: [[42.31994985876726, -36.994335383966266]],
        },
      },
      {
        type: "inv_triangle",
        methods: {
          beginPath: [[]],
          closePath: [[]],
          lineTo: [[42.084969240505984, -41.79924788150892]],
          moveTo: [[41.915030759494016, -32.20075211849108]],
        },
      },
      {
        type: "bar",
        methods: {
          beginPath: [[]],
          closePath: [[]],
          lineTo: [[42.14161540084331, -44.998746469181526]],
          moveTo: [[41.85838459915669, -29.00125353081847]],
        },
      },
      {
        type: "vee",
        methods: {
          beginPath: [[]],
          closePath: [[]],
          lineTo: [[34.001253530818474, -37.14161540084331]],
          moveTo: [[25.917537821130956, -32.4839829201777]],
        },
      },
      {
        type: "arrow",
        methods: {
          beginPath: [[]],
          closePath: [[]],
          lineTo: [[25.917537821130956, -32.4839829201777]],
          moveTo: [[42, -37]],
        },
      },
      {
        type: undefined,
        methods: {
          beginPath: [[]],
          closePath: [[]],
          lineTo: [[25.917537821130956, -32.4839829201777]],
          moveTo: [[42, -37]],
        },
      },
    ].forEach(({ methods, type }): void => {
      describe(`${type}`, function (): void {
        const ctx = Object.keys(methods).reduce((acc, method): any => {
          acc[method] = spy();
          return acc;
        }, {} as any);

        const arrowData = {
          type,
          point: { x: 42, y: -37 },
          angle: 44,
          length: 16,
        };

        it("draw", function (): void {
          EndPoints.draw(ctx, arrowData);
        });

        Object.entries(methods).forEach(([method, expected]): void => {
          it(`${method}`, function (): void {
            expect(ctx[method].callCount, "call count").to.be.at.least(1);
            expected.forEach((args, i): void => {
              expect(ctx[method].getCall(i).args).to.deep.equal(args);
            });
          });
        });
      });
    });
  });
});
