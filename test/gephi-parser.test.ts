import { expect } from "chai";
import { ColorObject, VisData, parseGephi } from "../lib/network/gephiParser";

describe("Gephi parser", function (): void {
  it("Empty dataset", function (): void {
    const visData: VisData = parseGephi({
      nodes: [],
      edges: [],
    });

    expect(
      visData,
      "Object with empty arrays should be returned"
    ).to.deep.equal({
      nodes: [],
      edges: [],
    });
  });

  it("1 node with id", function (): void {
    const visData: VisData = parseGephi({
      nodes: [
        {
          id: 77,
        },
      ],
      edges: [],
    });

    expect(
      visData,
      "All properties should be present but no more than that"
    ).to.deep.equal({
      nodes: [
        {
          id: 77,
          fixed: false,
        },
      ],
      edges: [],
    });
  });

  it("2 nodes with ids and 1 edge with id, from, to", function (): void {
    const visData: VisData = parseGephi({
      nodes: [
        {
          id: "from",
        },
        {
          id: "to",
        },
      ],
      edges: [
        {
          id: 77,
          source: "from",
          target: "to",
        },
      ],
    });

    expect(
      visData,
      "All properties should be present but no more than that"
    ).to.deep.equal({
      nodes: [
        {
          id: "from",
          fixed: false,
        },
        {
          id: "to",
          fixed: false,
        },
      ],
      edges: [
        {
          id: 77,
          from: "from",
          to: "to",
        },
      ],
    });
  });

  it("2 nodes with ids, attributes and 2 edges with id, from, to, attributes", function (): void {
    const fromAttrs = {
      title: "from title",
      dummy: "from dummy",
    };
    const toAttrs = {
      dummy: "to dummy",
    };

    const visData: VisData = parseGephi({
      nodes: [
        {
          id: "from",
          attributes: fromAttrs,
        },
        {
          id: "to",
          attributes: toAttrs as any,
        },
      ],
      edges: [
        {
          id: 77,
          source: "from",
          target: "to",
          attributes: fromAttrs as any,
        },
        {
          id: "79",
          source: "from",
          target: "to",
          attributes: toAttrs as any,
        },
      ],
    });

    expect(
      visData,
      "All properties should be present but no more than that"
    ).to.deep.equal({
      nodes: [
        {
          id: "from",
          fixed: false,
          title: "from title",
          attributes: fromAttrs,
        },
        {
          id: "to",
          fixed: false,
          attributes: toAttrs,
        },
      ],
      edges: [
        {
          id: 77,
          from: "from",
          to: "to",
          title: "from title",
          attributes: fromAttrs,
        },
        {
          id: "79",
          from: "from",
          to: "to",
          attributes: toAttrs,
        },
      ],
    });

    expect(
      visData.nodes[0].attributes,
      "Attributes object should be copyied as is"
    ).to.equal(fromAttrs);
    expect(
      visData.nodes[1].attributes,
      "Attributes object should be copyied as is"
    ).to.equal(toAttrs);
    expect(
      visData.edges[0].attributes,
      "Attributes object should be copyied as is"
    ).to.equal(fromAttrs);
    expect(
      visData.edges[1].attributes,
      "Attributes object should be copyied as is"
    ).to.equal(toAttrs);
  });

  it("1 node with id, label, size, title, x, y", function (): void {
    const visData: VisData = parseGephi({
      nodes: [
        {
          id: 0,
          label: "label",
          size: 37,
          title: "title",
          x: 24,
          y: 25,
        },
      ],
      edges: [],
    });

    expect(
      visData,
      "All properties should be present but no more than that"
    ).to.deep.equal({
      nodes: [
        {
          fixed: false,
          id: 0,
          label: "label",
          size: 37,
          title: "title",
          x: 24,
          y: 25,
        },
      ],
      edges: [],
    });
  });

  it("1 edge with id, label, source, target, type", function (): void {
    const visData: VisData = parseGephi({
      nodes: [],
      edges: [
        {
          id: "edge",
          label: "label",
          source: "noneS",
          target: "noneT",
          type: "Directed",
        },
      ],
    });

    expect(
      visData,
      "All properties should be present but no more than that"
    ).to.deep.equal({
      nodes: [],
      edges: [
        {
          arrows: "to",
          from: "noneS",
          id: "edge",
          label: "label",
          to: "noneT",
        },
      ],
    });
  });

  describe("Node fixed", function (): void {
    it("Defaults", function (): void {
      const visData: VisData = parseGephi({
        nodes: [
          {
            id: 0,
          },
        ],
        edges: [],
      });

      expect(visData, "Explicitly not fixed by default").to.deep.equal({
        nodes: [
          {
            fixed: false,
            id: 0,
          },
        ],
        edges: [],
      });
    });

    it("False", function (): void {
      const visData: VisData = parseGephi(
        {
          nodes: [
            {
              id: 0,
            },
          ],
          edges: [],
        },
        { fixed: false }
      );

      expect(visData, "False if false").to.deep.equal({
        nodes: [
          {
            fixed: false,
            id: 0,
          },
        ],
        edges: [],
      });
    });

    it("True without complete position", function (): void {
      const visData: VisData = parseGephi(
        {
          nodes: [
            {
              id: 0,
            },
            {
              id: 1,
              x: 24,
            },
            {
              id: 2,
              y: 25,
            },
          ],
          edges: [],
        },
        { fixed: true }
      );

      expect(
        visData,
        "False if no or incomplete position is available"
      ).to.deep.equal({
        nodes: [
          {
            fixed: false,
            id: 0,
          },
          {
            fixed: false,
            id: 1,
            x: 24,
          },
          {
            fixed: false,
            id: 2,
            y: 25,
          },
        ],
        edges: [],
      });
    });

    it("True with complete position", function (): void {
      const visData: VisData = parseGephi(
        {
          nodes: [
            {
              id: 0,
              x: 24,
              y: 25,
            },
          ],
          edges: [],
        },
        { fixed: true }
      );

      expect(visData, "True if complete position is available").to.deep.equal({
        nodes: [
          {
            fixed: true,
            id: 0,
            x: 24,
            y: 25,
          },
        ],
        edges: [],
      });
    });
  });

  describe("Node color parsing", function (): void {
    const colorString = "#012345";
    const colorObject: ColorObject = {
      background: colorString,
      border: colorString,
      highlight: {
        background: colorString,
        border: colorString,
      },
      hover: {
        background: colorString,
        border: colorString,
      },
    };

    it("Defaults", function (): void {
      const visData: VisData = parseGephi({
        nodes: [
          {
            id: 0,
            color: colorString,
          },
        ],
        edges: [],
      });

      expect(visData, "Expanded to an object by default").to.deep.equal({
        nodes: [
          {
            color: colorObject,
            fixed: false,
            id: 0,
          },
        ],
        edges: [],
      });
    });

    it("False", function (): void {
      const visData: VisData = parseGephi(
        {
          nodes: [
            {
              id: 0,
              color: colorString,
            },
          ],
          edges: [],
        },
        { parseColor: false }
      );

      expect(
        visData,
        "Expanded to an object if parseColor is false"
      ).to.deep.equal({
        nodes: [
          {
            color: colorObject,
            fixed: false,
            id: 0,
          },
        ],
        edges: [],
      });
    });

    it("True", function (): void {
      const visData: VisData = parseGephi(
        {
          nodes: [
            {
              id: 0,
              color: colorString,
            },
          ],
          edges: [],
        },
        { parseColor: true }
      );

      expect(visData, "Left as a string if parseColor is true").to.deep.equal({
        nodes: [
          {
            color: colorString,
            fixed: false,
            id: 0,
          },
        ],
        edges: [],
      });
    });
  });

  describe("Edge inherit color", function (): void {
    it("Defaults", function (): void {
      const visData: VisData = parseGephi({
        nodes: [
          {
            id: "from",
          },
          {
            id: "to",
          },
        ],
        edges: [
          {
            id: 77,
            source: "from",
            target: "to",
          },
          {
            color: "#00FFFF",
            id: 78,
            source: "from",
            target: "to",
          },
        ],
      });

      expect(visData, "Color should be used if present").to.deep.equal({
        nodes: [
          {
            id: "from",
            fixed: false,
          },
          {
            id: "to",
            fixed: false,
          },
        ],
        edges: [
          {
            id: 77,
            from: "from",
            to: "to",
          },
          {
            color: "#00FFFF",
            id: 78,
            from: "from",
            to: "to",
          },
        ],
      });
    });

    it("False", function (): void {
      const visData: VisData = parseGephi(
        {
          nodes: [
            {
              id: "from",
            },
            {
              id: "to",
            },
          ],
          edges: [
            {
              id: 77,
              source: "from",
              target: "to",
            },
            {
              color: "#00FFFF",
              id: 78,
              source: "from",
              target: "to",
            },
          ],
        },
        { inheritColor: false }
      );

      expect(visData, "Color should be used if present").to.deep.equal({
        nodes: [
          {
            id: "from",
            fixed: false,
          },
          {
            id: "to",
            fixed: false,
          },
        ],
        edges: [
          {
            id: 77,
            from: "from",
            to: "to",
          },
          {
            color: "#00FFFF",
            id: 78,
            from: "from",
            to: "to",
          },
        ],
      });
    });

    it("True", function (): void {
      const visData: VisData = parseGephi(
        {
          nodes: [
            {
              id: "from",
            },
            {
              id: "to",
            },
          ],
          edges: [
            {
              id: 77,
              source: "from",
              target: "to",
            },
            {
              color: "#00FFFF",
              id: 78,
              source: "from",
              target: "to",
            },
          ],
        },
        { inheritColor: true }
      );

      expect(visData, "Color should be ignored event if present").to.deep.equal(
        {
          nodes: [
            {
              id: "from",
              fixed: false,
            },
            {
              id: "to",
              fixed: false,
            },
          ],
          edges: [
            {
              id: 77,
              from: "from",
              to: "to",
            },
            {
              id: 78,
              from: "from",
              to: "to",
            },
          ],
        }
      );
    });
  });
});
