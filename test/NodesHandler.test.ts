import { deepFreeze } from "./helpers";
import { expect } from "chai";
import { spy, stub } from "sinon";

import NodesHandler from "../lib/network/modules/NodesHandler";

type Id = number | string;

describe("NodesHandler", function (): void {
  const createNode = (
    id: number,
    edges: { id: Id; fromId: Id; toId: Id }[] = []
  ): any => ({
    id,
    shape: {
      boundingBox: { top: id, right: id + 1, bottom: id + 2, left: id + 3 },
    },
    updateShape: spy(),
    updateLabelModule: spy(),
    needsRefresh: spy(),
    edges,
  });

  const createThis = (): any => {
    const inheritedStub = stub().throws(
      "Methods of inherited objects shoudn’t be called."
    );

    const nodes = Object.create({
      inherited: {
        updateShape: inheritedStub,
        updateLabelModule: inheritedStub,
        needsRefresh: inheritedStub,
      },
    });
    nodes[0] = createNode(0, []);
    nodes[1] = createNode(1, [{ id: "e1-X", fromId: 1, toId: "X" }]);
    nodes[2] = createNode(2, [{ id: "e2-3", fromId: 2, toId: 3 }]);
    nodes[3] = createNode(3, [
      { id: "e2-3", fromId: 2, toId: 3 },
      { id: "e3-3", fromId: 3, toId: 3 },
    ]);

    return {
      body: {
        nodes,
        emitter: { emit: spy() },
      },
      options: {},
    };
  };

  describe(".getPosition", function () {
    const mockThis = deepFreeze({
      body: {
        nodes: {
          0: { x: 2400, y: 2500 },
          1: { x: 2401, y: 2501 },
          2: { x: 2402, y: 2502 },
          3: { x: 2403, y: 2503 },
        },
      },
    });

    it("should be able to locate a position for a node that exists", function () {
      expect(
        NodesHandler.prototype.getPosition.call(mockThis, 3)
      ).to.deep.equal(mockThis.body.nodes[3]);
    });

    it("should throw an error if no id is given", () => {
      try {
        NodesHandler.prototype.getPosition.call(mockThis);
      } catch (e) {
        expect(e.message).to.equal(
          "No id was specified for getPosition method."
        );
      }
    });

    it("should throw an error if a non-existent id is given", () => {
      try {
        NodesHandler.prototype.getPosition.call(mockThis, "not here");
      } catch (e) {
        expect(e.message).to.equal(
          "NodeId provided for getPosition does not exist. Provided: not here"
        );
      }
    });
  });

  describe(".getPositions", function (): void {
    const mockThis = deepFreeze({
      body: {
        nodeIndices: [0, 1, 2, 3],
        nodes: {
          0: { x: 2400, y: 2500 },
          1: { x: 2401, y: 2501 },
          2: { x: 2402, y: 2502 },
          3: { x: 2403, y: 2503 },
        },
      },
    });

    it("An Id → Point dictionary with all items should be returned if no ids were specified", function (): void {
      expect(NodesHandler.prototype.getPositions.call(mockThis)).to.deep.equal({
        0: { x: 2400, y: 2500 },
        1: { x: 2401, y: 2501 },
        2: { x: 2402, y: 2502 },
        3: { x: 2403, y: 2503 },
      });
    });

    it("An Id → Point dictionary with requested item but nothing more should be returned", function (): void {
      expect(
        NodesHandler.prototype.getPositions.call(mockThis, 1)
      ).to.deep.equal({
        1: { x: 2401, y: 2501 },
      });
    });

    it("An empty Id → Point dictionary should be returned if the item wasn’t found", function (): void {
      expect(
        NodesHandler.prototype.getPositions.call(mockThis, "missing")
      ).to.deep.equal({});
    });

    it("An empty Id → Point dictionary should be returned for empty array", function (): void {
      expect(
        NodesHandler.prototype.getPositions.call(mockThis, [])
      ).to.deep.equal({});
    });

    it("An Id → Point dictionary with all requested items but nothing more should be returned", function (): void {
      expect(
        NodesHandler.prototype.getPositions.call(mockThis, [0, 2, 3])
      ).to.deep.equal({
        0: { x: 2400, y: 2500 },
        2: { x: 2402, y: 2502 },
        3: { x: 2403, y: 2503 },
      });
    });

    it("Missing items should be silently ignored and found should be returned", function (): void {
      expect(
        NodesHandler.prototype.getPositions.call(mockThis, [
          1,
          "missing",
          0,
          -77,
        ])
      ).to.deep.equal({
        0: { x: 2400, y: 2500 },
        1: { x: 2401, y: 2501 },
      });
    });
  });

  describe(".setOptions", function (): void {
    it("Change chape", function (): void {
      const mockThis = createThis();
      NodesHandler.prototype.setOptions.call(mockThis, { shape: "test-shape" });

      expect(
        mockThis.options,
        "The supplied shape should be saved into the options."
      )
        .to.have.ownProperty("shape")
        .that.equals("test-shape");
      [
        mockThis.body.nodes[0],
        mockThis.body.nodes[1],
        mockThis.body.nodes[2],
        mockThis.body.nodes[3],
      ].forEach((node): void => {
        expect(
          node.updateShape.callCount,
          "The shape of all nodes should be updated."
        ).to.equal(1);
      });
    });

    it("Change font", function (): void {
      const mockThis = createThis();
      NodesHandler.prototype.setOptions.call(mockThis, {
        font: "13px fira code cyan",
      });

      expect(
        mockThis.options,
        "The supplied font should be saved into the options."
      )
        .to.have.ownProperty("font")
        .that.equals("13px fira code cyan");
      [
        mockThis.body.nodes[0],
        mockThis.body.nodes[1],
        mockThis.body.nodes[2],
        mockThis.body.nodes[3],
      ].forEach((node): void => {
        expect(
          node.updateLabelModule.callCount,
          "The label module of all nodes should be updated."
        ).to.equal(1);
        expect(
          node.needsRefresh.callCount,
          "All nodes should be marked for refresh."
        ).to.equal(1);
      });
    });

    it("Change size", function (): void {
      const mockThis = createThis();
      NodesHandler.prototype.setOptions.call(mockThis, {
        size: 13,
      });

      expect(
        mockThis.options,
        "The supplied size should be saved into the options."
      )
        .to.have.ownProperty("size")
        .that.equals(13);
      [
        mockThis.body.nodes[0],
        mockThis.body.nodes[1],
        mockThis.body.nodes[2],
        mockThis.body.nodes[3],
      ].forEach((node): void => {
        expect(
          node.needsRefresh.callCount,
          "All nodes should be marked for refresh."
        ).to.equal(1);
      });
    });
  });

  describe(".getBoundingBox", function (): void {
    it("Existing nodes", function (): void {
      const mockThis = createThis();

      for (let id = 0; id < 4; ++id) {
        expect(
          NodesHandler.prototype.getBoundingBox.call(mockThis, id)
        ).to.deep.equal({
          top: id,
          right: id + 1,
          bottom: id + 2,
          left: id + 3,
        });
      }
    });

    it("Missing node", function (): void {
      const mockThis = createThis();
      let ret: any;

      expect((): void => {
        ret = NodesHandler.prototype.getBoundingBox.call(mockThis, -1);
      }, "Missing nodes should be silently ignored (maybe with console message).").to.not.throw();

      expect(ret, "Missing nodes should return undefined.").to.be.undefined;
    });
  });

  describe(".getConnectedNodes", function (): void {
    it("Nodes with edges", function (): void {
      const mockThis = createThis();

      expect(
        NodesHandler.prototype.getConnectedNodes.call(mockThis, 1)
      ).to.deep.equal(["X"]);

      expect(
        NodesHandler.prototype.getConnectedNodes.call(mockThis, 2)
      ).to.deep.equal([3]);

      expect(
        NodesHandler.prototype.getConnectedNodes.call(mockThis, 3).sort()
      ).to.deep.equal([2, 3].sort());
    });

    it("Node with no edges", function (): void {
      const mockThis = createThis();
      expect(
        NodesHandler.prototype.getConnectedNodes.call(mockThis, 0),
        "Empty array should be returned if there are no connected nodes."
      )
        .to.be.an("array")
        .that.has.lengthOf(0);
    });

    it("Missing node", function (): void {
      const mockThis = createThis();
      let edges: undefined | never[] = undefined;

      expect((): void => {
        edges = NodesHandler.prototype.getConnectedNodes.call(mockThis, -1);
      }, "Missing nodes should be silently ignored (maybe with console message).").to.not.throw();

      expect(edges).to.be.an("array").that.has.lengthOf(0);
    });
  });

  describe(".getConnectedEdges", function (): void {
    it("Nodes with edges", function (): void {
      const mockThis = createThis();

      expect(
        NodesHandler.prototype.getConnectedEdges.call(mockThis, 1)
      ).to.deep.equal(["e1-X"]);

      expect(
        NodesHandler.prototype.getConnectedEdges.call(mockThis, 2)
      ).to.deep.equal(["e2-3"]);

      expect(
        NodesHandler.prototype.getConnectedEdges.call(mockThis, 3).sort()
      ).to.deep.equal(["e2-3", "e3-3"].sort());
    });

    it("Node with no edges", function (): void {
      const mockThis = createThis();
      expect(
        NodesHandler.prototype.getConnectedEdges.call(mockThis, 0),
        "Empty array should be returned if there are no connected edges."
      )
        .to.be.an("array")
        .that.has.lengthOf(0);
    });

    it("Missing node", function (): void {
      const mockThis = createThis();
      let edges: undefined | never[] = undefined;

      expect((): void => {
        edges = NodesHandler.prototype.getConnectedEdges.call(mockThis, -1);
      }, "Missing nodes should be silently ignored (maybe with console message).").to.not.throw();

      expect(edges).to.be.an("array").that.has.lengthOf(0);
    });
  });

  describe(".moveNode", function (): void {
    it("Existing node", function (): void {
      const mockThis = createThis();
      NodesHandler.prototype.moveNode.call(mockThis, 0, 13, 11);
      NodesHandler.prototype.moveNode.call(mockThis, 2, -5, -7);

      expect(mockThis.body.nodes[0]).to.have.ownProperty("x").that.equals(13);
      expect(mockThis.body.nodes[0]).to.have.ownProperty("y").that.equals(11);

      expect(mockThis.body.nodes[2]).to.have.ownProperty("x").that.equals(-5);
      expect(mockThis.body.nodes[2]).to.have.ownProperty("y").that.equals(-7);
    });

    it("Missing node", function (): void {
      const mockThis = createThis();
      expect((): void => {
        NodesHandler.prototype.moveNode.call(mockThis, -1, 13, 11);
      }, "Missing nodes should be silently ignored (maybe with console message).").to.not.throw();
    });
  });
});
