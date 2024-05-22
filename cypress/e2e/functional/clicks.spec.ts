import { VisEvent } from "../helpers";

context("Clicks", { testIsolation: false }, (): void => {
  /*
   * The canvas starts at 200x200 and ends at 400x400.
   */
  const canvasOffsetFromHTML = { x: 200, y: 200 };

  const clicks: (
    | {
        name?: undefined;
        shouldTrigger: false;
        x: number;
        y: number;
      }
    | {
        name?: string;
        shouldTrigger: true;
        x: number;
        y: number;
      }
  )[] = [
    /*
     * Clicking around.
     */
    { x: 50, y: 50, shouldTrigger: false },
    { x: 50, y: 150, shouldTrigger: false },
    { x: 50, y: 250, shouldTrigger: false },
    { x: 50, y: 350, shouldTrigger: false },
    { x: 50, y: 450, shouldTrigger: false },
    { x: 50, y: 550, shouldTrigger: false },
    { x: 150, y: 50, shouldTrigger: false },
    { x: 150, y: 150, shouldTrigger: false },
    { x: 150, y: 250, shouldTrigger: false },
    { x: 150, y: 350, shouldTrigger: false },
    { x: 150, y: 450, shouldTrigger: false },
    { x: 150, y: 550, shouldTrigger: false },
    { x: 250, y: 50, shouldTrigger: false },
    { x: 250, y: 150, shouldTrigger: false },
    { x: 250, y: 450, shouldTrigger: false },
    { x: 250, y: 550, shouldTrigger: false },
    { x: 350, y: 50, shouldTrigger: false },
    { x: 350, y: 150, shouldTrigger: false },
    { x: 350, y: 450, shouldTrigger: false },
    { x: 350, y: 550, shouldTrigger: false },
    { x: 450, y: 50, shouldTrigger: false },
    { x: 450, y: 150, shouldTrigger: false },
    { x: 450, y: 250, shouldTrigger: false },
    { x: 450, y: 350, shouldTrigger: false },
    { x: 450, y: 450, shouldTrigger: false },
    { x: 450, y: 550, shouldTrigger: false },
    { x: 550, y: 50, shouldTrigger: false },
    { x: 550, y: 150, shouldTrigger: false },
    { x: 550, y: 250, shouldTrigger: false },
    { x: 550, y: 350, shouldTrigger: false },
    { x: 550, y: 450, shouldTrigger: false },
    { x: 550, y: 550, shouldTrigger: false },

    /*
     * Clicking into the canvas.
     */
    { x: 250, y: 250, shouldTrigger: true, name: "TL" }, // top, left
    { x: 250, y: 275, shouldTrigger: true, name: "QL" }, // quarter from the top, left
    { x: 250, y: 350, shouldTrigger: true, name: "BL" }, // bottom, left
    { x: 275, y: 250, shouldTrigger: true, name: "TQ" }, // top, quarter from the left
    { x: 275, y: 275, shouldTrigger: true, name: "QQ" }, // quarter from the top, quarter from the left
    { x: 350, y: 250, shouldTrigger: true, name: "TR" }, // top, right
    { x: 350, y: 350, shouldTrigger: true, name: "BR" }, // bottom, right
  ];

  /*
   * Test the relative distance between nodes. For example x values of 0, 0.25
   * and 1 correspond to the node spacing of 1-2---3 where each dash represents
   * the same distance.
   * This way we don't have to take into account things like where exactly is
   * the center of the coordinate system, how much it is zoomed etc.
   */
  const canvasCoordinatesTests = [
    [
      { name: "TL", position: { x: 0, y: 0 } },
      { name: "TQ", position: { x: 0.25, y: 0.5 } },
      { name: "TR", position: { x: 1, y: 1 } },
    ],
    [
      { name: "TL", position: { x: 0, y: 0 } },
      { name: "QL", position: { x: 0.5, y: 0.25 } },
      { name: "BL", position: { x: 1, y: 1 } },
    ],
    [
      { name: "TL", position: { x: 0, y: 0 } },
      { name: "QQ", position: { x: 0.25, y: 0.25 } },
      { name: "BR", position: { x: 1, y: 1 } },
    ],
  ];

  const allEvents: VisEvent[] = [];
  const namedEvents = new Map<string, VisEvent>();

  it("Preparation", (): void => {
    cy.visit("http://localhost:58253/cypress/pages/events-target.html");

    cy.visRunWithWindow(({ network }): void => {
      network.on("click", (event: any): void => {
        allEvents.push(event);
      });
    });
  });

  describe("Clicks", function (): void {
    clicks.forEach(({ name, shouldTrigger, x, y }): void => {
      describe(`At ${x}x${y} ${name || ""}`, function (): void {
        const events: VisEvent[] = [];

        it("Triggering and capturing", (): void => {
          const clickListener = (event: VisEvent): void => {
            events.push(event);
          };

          cy.visRunWithWindow(({ network }): void => {
            network.on("click", clickListener);
          });

          cy.get("html").click(x, y);

          cy.visRunWithWindow(({ network }): void => {
            network.off("click", clickListener);
          });
        });

        it("Correct number of events", function (): void {
          if (shouldTrigger) {
            expect(events).to.to.have.lengthOf(1);
          } else {
            expect(events).to.to.have.lengthOf(0);
          }
        });

        if (shouldTrigger) {
          it("Correct DOM coordinates", function (): void {
            expect(events[0]).to.have.ownProperty("pointer");
            expect(events[0].pointer).to.have.ownProperty("DOM");
            expect(events[0].pointer.DOM).to.have.ownProperty("x");
            expect(events[0].pointer.DOM).to.have.ownProperty("y");

            expect(events[0].pointer.DOM.x).to.equal(
              x - canvasOffsetFromHTML.x
            );
            expect(events[0].pointer.DOM.y).to.equal(
              y - canvasOffsetFromHTML.y
            );

            if (name) {
              namedEvents.set(name, events[0]);
            }
          });
        }
      });
    });
  });

  describe("Relative event positions in canvas coordinetes", function (): void {
    canvasCoordinatesTests.forEach((config): void => {
      const name = config.map(({ name }): string => name).join(", ");

      describe(name, function (): void {
        ["x" as const, "y" as const].forEach((axis): void => {
          it(axis, function (): void {
            const axis0 = namedEvents.get(
              config.find(({ position }): boolean => position[axis] === 0)!.name
            ).pointer.canvas[axis];
            const axis1 = namedEvents.get(
              config.find(({ position }): boolean => position[axis] === 1)!.name
            ).pointer.canvas[axis];

            config.forEach(({ name, position }): void => {
              const canvas = namedEvents.get(name).pointer.canvas;
              expect(canvas[axis]).to.be.approximately(
                axis0 + position[axis] * (axis1 - axis0),
                0.0000000001 // Let minor rounding errors be forgiven.
              );
            });
          });
        });
      });
    });
  });
});
