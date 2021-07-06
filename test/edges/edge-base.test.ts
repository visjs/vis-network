import { expect } from "chai";
import { deepFreeze } from "../helpers";
import { body } from "./helpers";

import { EdgeBase } from "../../lib/network/modules/components/edges";

describe("EdgeBase", function (): void {
  it("constructor", function (): void {
    const options = deepFreeze({
      id: "E",
      from: 1,
      to: 3,
    });

    const edge = new EdgeBase(options, body as any, {} as any);

    expect(edge).to.have.ownProperty("options").that.equals(options);
    expect(edge).to.have.ownProperty("from").that.equals(body.nodes[1]);
    expect(edge).to.have.ownProperty("to").that.equals(body.nodes[3]);
    expect(edge).to.have.ownProperty("id").that.equals("E");
  });

  describe("shadow", function (): void {
    it("enable", function (): void {
      const ctx = {
        shadowColor: null,
        shadowBlur: null,
        shadowOffsetX: null,
        shadowOffsetY: null,
      };

      EdgeBase.prototype.enableShadow(
        ctx,
        deepFreeze({
          shadow: true,
          shadowColor: "#00FFFF",
          shadowSize: 123,
          shadowX: 456,
          shadowY: 789,
        })
      );

      expect(ctx).to.deep.equal({
        shadowColor: "#00FFFF",
        shadowBlur: 123,
        shadowOffsetX: 456,
        shadowOffsetY: 789,
      });
    });

    it("disable", function (): void {
      const ctx = {
        shadowColor: null,
        shadowBlur: null,
        shadowOffsetX: null,
        shadowOffsetY: null,
      };

      EdgeBase.prototype.disableShadow(
        ctx,
        deepFreeze({
          shadow: true,
        })
      );

      expect(ctx).to.deep.equal({
        shadowColor: "rgba(0,0,0,0)",
        shadowBlur: 0,
        shadowOffsetX: 0,
        shadowOffsetY: 0,
      });
    });
  });
});
