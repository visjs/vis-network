import { IdType, Point } from "../helpers";

function selectEditAndCheck(
  before: number,
  after: number,
  a: Point,
  b?: Point
): void {
  if (b) {
    let id: IdType;

    cy.visClickBetweenPoints(a, b);
    cy.visRun(({ edges, lastEvents: { click } }): void => {
      expect(click.edges).to.be.an("array").and.have.length(1);

      id = click.edges[0];

      if (before === 0) {
        expect(edges.get(id)).to.not.have.own.property("label");
      } else {
        expect(edges.get(id))
          .to.have.own.property("label")
          .that.equals("Edit: " + before);
      }
    });

    cy.visEditSelected();
    cy.visRun(({ edges }): void => {
      if (after === 0) {
        expect(edges.get(id)).to.not.have.own.property("label");
      } else {
        expect(edges.get(id))
          .to.have.own.property("label")
          .that.equals("Edit: " + after);
      }
    });
  } else {
    let id: IdType;

    cy.visClickPoint(a);
    cy.visRun(({ nodes, lastEvents: { click } }): void => {
      expect(click.nodes).to.be.an("array").and.have.length(1);

      id = click.nodes[0];

      if (before === 0) {
        expect(nodes.get(id)).to.have.own.property("label").that.equals("new");
      } else {
        expect(nodes.get(id))
          .to.have.own.property("label")
          .that.equals("Edit: " + before);
      }
    });

    cy.visEditSelected();
    cy.visRun(({ nodes }): void => {
      if (after === 0) {
        expect(nodes.get(id)).to.not.have.own.property("label");
      } else {
        expect(nodes.get(id))
          .to.have.own.property("label")
          .that.equals("Edit: " + after);
      }
    });
  }
}

context("Manipulation GUI", () => {
  beforeEach(() => {
    cy.visVisitUniversal({ manipulation: true });
  });

  it("Add a node", () => {
    cy.visPlaceNode(101, 102);
  });

  it("Add 1 node", () => {
    const node = { x: 201, y: 202 };

    cy.visPlaceNode(node.x, node.y);
  });

  it("Add 2 nodes and 1 edge", () => {
    const b = { x: 101, y: 102 };
    const a = { x: 201, y: 202 };

    cy.visPlaceNode(b.x, b.y);
    cy.visPlaceNode(a.x, a.y);

    cy.visConnectNodes(a, b);
  });

  it("Add 2 nodes, 1 edge then delete 1 edge", () => {
    const b = { x: 101, y: 102 };
    const a = { x: 201, y: 202 };

    cy.visPlaceNode(b.x, b.y);
    cy.visPlaceNode(a.x, a.y);

    cy.visConnectNodes(a, b);

    cy.visCheckIds(
      (): void => {},
      (): void => {
        cy.visClickBetweenPoints(a, b);
        cy.visDeleteSelected();
      },
      ({ addedEdgeIds, removedEdgeIds }): void => {
        // Check that exactly one edge was removed.
        expect(addedEdgeIds, "There should be no new edges.").to.have.length(0);
        expect(
          removedEdgeIds,
          "There should be exactly one edge removed."
        ).to.have.length(1);
      }
    );
  });

  it("Add 5 nodes, 4 edges and delete the cental node", () => {
    const tr = { x: 301, y: 102 };
    const br = { x: 301, y: 302 };
    const bl = { x: 101, y: 302 };
    const tl = { x: 101, y: 102 };
    const c = { x: 201, y: 202 };

    cy.visPlaceNode(tr.x, tr.y);
    cy.visPlaceNode(br.x, br.y);
    cy.visPlaceNode(bl.x, bl.y);
    cy.visPlaceNode(tl.x, tl.y);
    cy.visPlaceNode(c.x, c.y);

    cy.visConnectNodes(c, tr);
    cy.visConnectNodes(c, br);
    cy.visConnectNodes(c, bl);
    cy.visConnectNodes(c, tl);

    cy.visRun(({ nodes, edges }): void => {
      expect(nodes.getIds()).to.have.length(5);
      expect(edges.getIds()).to.have.length(4);
    });
    cy.visClickPoint(c);
    cy.visDeleteSelected();
    cy.visRun(({ nodes, edges }): void => {
      expect(nodes.getIds()).to.have.length(4);
      expect(edges.getIds()).to.have.length(0);
    });
  });

  it("Add and edit 1 node", () => {
    const a = { x: 201, y: 202 };

    cy.visPlaceNode(a.x, a.y);

    selectEditAndCheck(0, 1, a);
    selectEditAndCheck(1, 2, a);
    selectEditAndCheck(2, 3, a);
  });

  it("Add 2 nodes, 1 edge and edit all of them", () => {
    const a = { x: 101, y: 102 };
    const b = { x: 201, y: 202 };

    cy.visPlaceNode(a.x, a.y);
    cy.visPlaceNode(b.x, b.y);

    cy.visConnectNodes(a, b);

    selectEditAndCheck(0, 1, a);
    selectEditAndCheck(0, 2, b);
    selectEditAndCheck(0, 3, a, b);

    selectEditAndCheck(1, 4, a);
    selectEditAndCheck(2, 5, b);
    selectEditAndCheck(3, 6, a, b);
  });
});
