import { expect } from "chai";

import Edge from "../lib/network/modules/components/Edge";

describe("Edge color", function (): void {
  const setOptions = Edge.prototype.setOptions;

  describe("parse options", function (): void {
    it("object", function (): void {
      const parentOptions = {
        color: {
          color: "#012345",
          highlight: "#012345",
          hover: "#012345",
          inherit: false,
          opacity: 1,
        },
      };
      const newOptions = {
        color: {
          color: "#543210",
          highlight: "#654321",
          hover: "#765432",
          inherit: false,
          opacity: 1,
        },
      };
      const allowDeletion = false;
      const globalOptions = {};
      const copyFromGlobals = false;

      Edge.parseOptions(
        parentOptions,
        newOptions,
        allowDeletion,
        globalOptions,
        copyFromGlobals
      );

      expect(parentOptions).to.have.ownProperty("color").that.deep.equals({
        color: "#543210",
        highlight: "#654321",
        hover: "#765432",
        inherit: false,
        opacity: 1,
      });
    });

    it("string", function (): void {
      const parentOptions = {
        color: {
          color: "#012345",
          highlight: "#123456",
          hover: "#234567",
          inherit: false,
          opacity: 1,
        },
      };
      const newOptions = { color: "#543210" };
      const allowDeletion = false;
      const globalOptions = {};
      const copyFromGlobals = false;

      Edge.parseOptions(
        parentOptions,
        newOptions,
        allowDeletion,
        globalOptions,
        copyFromGlobals
      );

      expect(parentOptions).to.have.ownProperty("color").that.deep.equals({
        color: "#543210",
        highlight: "#543210",
        hover: "#543210",
        inherit: false,
        opacity: 1,
      });
    });
  });
});
