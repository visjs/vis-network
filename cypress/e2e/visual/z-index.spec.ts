const EXTERNAL_LABEL_SHAPES = new Set<string>([
  "custom",
  "diamond",
  "dot",
  "hexagon",
  "square",
  "star",
  "triangle",
  "triangleDown",
]);
const INTERNAL_LABEL_SHAPES = new Set<string>([
  "box",
  "circle",
  "database",
  "ellipse",
  "text",
]);

const EXTERNAL_LABEL = new Array(15)
  .fill(null)
  .map((): string => "This label should be above edge labels and arrows.")
  .join("\n");
const INTERNAL_LABEL = [
  "This",
  "label",
  "should",
  "be",
  "above",
  "edge",
  "labels",
  "but",
  "bellow",
  "arrows.",
].join("\n");

context("Z-index", (): void => {
  describe("external node labels > edge arrows > internal node labels > nodes > edge labels > edges", (): void => {
    for (const shape of [...EXTERNAL_LABEL_SHAPES, ...INTERNAL_LABEL_SHAPES]) {
      it(shape, function (): void {
        cy.visSimpleCanvasSnapshot(
          `z-index_${shape}`,
          {
            nodes: [
              {
                id: 1,
                fixed: true,
                x: 0,
                y: -300,
                shape,
                label: EXTERNAL_LABEL_SHAPES.has(shape)
                  ? EXTERNAL_LABEL
                  : INTERNAL_LABEL,
                font: {
                  color: "green",
                  size: 40,
                },
                ctxRenderer:
                  "" +
                  (({ ctx, x, y }: any): any => {
                    const size = 300;
                    const left = x - size / 2;
                    const top = y - size / 2;
                    return {
                      drawNode() {
                        ctx.fillStyle = "purple";
                        ctx.fillRect(left, top, size, size);
                      },
                      drawExternalLabel() {
                        ctx.font = "200px serif";
                        ctx.fillStyle = "green";
                        ctx.fillText("████", left, y + size);
                      },
                    };
                  }),
              },
              {
                id: 3,
                fixed: true,
                x: 100,
                y: 300,
                shape: "box",
                label: new Array(5)
                  .fill(null)
                  .map(
                    (): string =>
                      "This label should be above edge labels but bellow arrows."
                  )
                  .join("\n"),
                font: {
                  color: "black",
                  size: 20,
                },
              },
            ],
            edges: [
              {
                id: 2,
                from: 1,
                to: 3,
                label: new Array(80)
                  .fill(null)
                  .map(
                    (): string =>
                      "This label should be bellow nodes and their labels but above edge arrows."
                  )
                  .join("\n"),
                font: {
                  color: "red",
                  size: 10,
                },
                arrows: {
                  from: {
                    enabled: true,
                    scaleFactor: 6,
                  },
                  middle: {
                    enabled: true,
                    scaleFactor: 6,
                  },
                  to: {
                    enabled: true,
                    scaleFactor: 6,
                  },
                },
                endPointOffset: {
                  from: -50,
                  to: -50,
                },
              },
            ],
          },
          { requireNewerVersionThan: "8.0.2" }
        );
      });
    }
  });
});
