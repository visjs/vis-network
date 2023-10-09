context("Label rendering", (): void => {
  for (const multi of [false, true, "md", "html"]) {
    describe(`Multi: ${multi}`, function (): void {
      for (const { variantName, color, background, size } of [
        { variantName: "defaults" },
        {
          variantName: "changed",

          align: "right",
          background: "#440044",
          color: "#AA00AA",
          face: "serif",
          size: 25,
          strokeColor: "#FFFFFF",
          strokeWidth: 2,
          vadjust: 12,

          bold: {
            color: "#FF0000",
            size: 40,
            vadjust: 20,
          },
          boldital: {
            color: "#FFFF00",
            size: 30,
            vadjust: 5,
          },
          ital: {
            color: "#00FF00",
            size: 20,
            vadjust: -10,
          },
          mono: {
            color: "#0000FF",
            size: 10,
            vadjust: -20,
          },
        },
      ]) {
        describe(`Variant: ${variantName}`, function (): void {
          for (const [labelName, label] of [
            // ASCII, single line
            ["ASCII", "test"],
            // UTF, multi line
            ["UTF", "+\něščřžýáíé\n=\t|\nÉÍÁÝŽŘČŠĚ\n<𝄞>"],
            // Markdown
            [
              "MD",
              "Multi: " +
                " ".repeat(10) +
                "`códé`" +
                ",\n" +
                "*bóld*" +
                ", " +
                "-ítálícs-" +
                ", " +
                "nórmál" +
                ",\n" +
                "-*bóld+ítálícs*-" +
                ", " +
                "*-ítálícs+bóld-*.",
            ],
            // HTML
            [
              "HTML",
              "Multi: " +
                " ".repeat(10) +
                "<code>códé</code>" +
                ",\n" +
                "<b>bóld</b>" +
                ", " +
                "<i>ítálícs</i>" +
                ", " +
                "nórmál" +
                ",\n" +
                "<i><b>bóld+ítálícs</b></i>" +
                ", " +
                "<b><i>ítálícs+bóld</i></b>.",
            ],
          ]) {
            it(
              JSON.stringify(
                label.replace(/\t/g, "<HT>").replace(/\n/g, "<LF>")
              ),
              (): void => {
                cy.visSimpleCanvasSnapshot(
                  `${multi}-${variantName}-${labelName}`,
                  {
                    nodes: [
                      {
                        id: 1,
                        fixed: true,
                        x: -50,
                        y: -300,
                        shape: "box",
                        label,
                      },
                      {
                        id: 3,
                        fixed: true,
                        x: 50,
                        y: 300,
                        shape: "square",
                        label,
                      },
                    ],
                    edges: [{ id: 2, from: 1, to: 3, label }],
                    options: {
                      nodes: {
                        font: { background, color, multi, size },
                      },
                      edges: {
                        font: { background, color, multi, size },
                      },
                    },
                  }
                );
              }
            );
          }
        });
      }
    });
  }
});
