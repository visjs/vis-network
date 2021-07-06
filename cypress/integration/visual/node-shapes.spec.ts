import { pureDeepObjectAssign } from "vis-util";
import { createGridPoints } from "../helpers";

const shapes = [
  "box",
  "circle",
  "database",
  "diamond",
  "dot",
  "ellipse",
  "hexagon",
  "icon",
  "square",
  "star",
  "text",
  "triangle",
  "triangleDown",
] as const;

context("Node shapes", (): void => {
  const points = createGridPoints(shapes.length);

  describe("Options", function (): void {
    const variantGroups: any[][] = [
      [
        { shapeProperties: { borderDashes: true } },
        { shapeProperties: { borderDashes: [1, 2, 5, 9, 4, 6, 3, 7, 8] } },
      ],
      [
        { shapeProperties: { borderRadius: 0 } },
        { shapeProperties: { borderRadius: 12 } },
      ],
      [{ borderWidth: 1 }, { borderWidth: 7 }],
      [
        { color: "#ACDC00" },
        { color: { border: "#00AA00", background: "#00AAAA" } },
      ],
      [{ font: { size: 17 } }, { font: { size: 31 } }],
      [{ icon: { code: "\uDB81\uDF85", face: '"Material Design Icons"' } }],
      [{ label: "TEST" }, { label: "Test Label" }],
      [{ opacity: 0.6 }, { opacity: 0.8 }],
      [
        { shadow: true },
        { shadow: { color: "rgba(0,200,200,0.3)", size: 17, x: 7, y: -11 } },
      ],
      [{ size: 13 }, { size: 43 }],
    ];

    const configs: any[] = [];

    // All defaults
    configs.push({});

    // Each variant from each group on it's own.
    for (const group of variantGroups) {
      configs.push(
        ...group.map((variant): any => pureDeepObjectAssign(variant))
      );
    }

    // All groups combined.
    const longest = Math.max(
      ...variantGroups.map((variant): number => variant.length)
    );
    for (let i = 0; i < longest; ++i) {
      configs.push(
        pureDeepObjectAssign(
          {},
          ...variantGroups.map((group): any => group[i % group.length])
        )
      );
    }

    configs.forEach((config, i): void => {
      const screenshotNumber = i + 1;
      it(`${screenshotNumber}: ${JSON.stringify(config)}`, (): void => {
        cy.visSimpleCanvasSnapshot(screenshotNumber, {
          nodes: shapes.map((shape, id): any => ({
            ...config,
            shape,
            id,
            fixed: true,
            ...points[id],
          })),
          edges: [],
        });
      });
    });
  });

  describe("Border width", function (): void {
    it("Default", function (): void {
      cy.visVisitUniversal({
        nodes: shapes.map((shape, id): any => ({
          shape,
          id,
          fixed: true,
          ...points[id],
        })),
        edges: [],
      });
      cy.visSnapshotOpenedPage("border-widths-default-width-unselected");

      cy.visRun(({ network }): void => {
        network.selectNodes(shapes.map((_v, id): number => id));
      });
      cy.visSnapshotOpenedPage("border-widths-default-width-selected");
    });

    it("Custom width", function (): void {
      cy.visVisitUniversal({
        nodes: shapes.map((shape, id): any => ({
          shape,
          id,
          fixed: true,
          ...points[id],
          borderWidth: 5,
        })),
        edges: [],
      });
      cy.visSnapshotOpenedPage("border-widths-custom-width-unselected");

      cy.visRun(({ network }): void => {
        network.selectNodes(shapes.map((_v, id): number => id));
      });
      cy.visSnapshotOpenedPage("border-widths-custom-width-selected");
    });

    it("Custom widths", function (): void {
      cy.visVisitUniversal(
        {
          nodes: shapes.map((shape, id): any => ({
            shape,
            id,
            fixed: true,
            ...points[id],
            borderWidth: 9,
            borderWidthSelected: 4,
          })),
          edges: [],
        },
        { requireNewerVersionThan: "8.5.1" }
      );
      cy.visSnapshotOpenedPage("border-widths-custom-widths-unselected");

      cy.visRun(({ network }): void => {
        network.selectNodes(shapes.map((_v, id): number => id));
      });
      cy.visSnapshotOpenedPage("border-widths-custom-widths-selected");
    });
  });
});
