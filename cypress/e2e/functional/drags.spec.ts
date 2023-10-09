import { Point, VisEvent } from "../helpers";

/**
 * Create drag events according to given path.
 *
 * @param coords - Defined the path and the names of events to be triggered
 * along the way.
 * @returns An array that will be filled with events once Cypress decides to
 * run it.
 */
function drag(
  coords: {
    name: "pointerover" | "pointermove" | "pointerdown" | "pointerup";
    x: number;
    y: number;
  }[]
): { name: string; event: VisEvent }[] {
  const events: { name: string; event: VisEvent }[] = [];

  const eventListener =
    (name: string) =>
    (event: VisEvent): void => {
      events.push({ name, event });
    };

  cy.visRunWithWindow(({ network }): void => {
    network.on("dragStart", eventListener("dragStart"));
    network.on("dragging", eventListener("dragging"));
    network.on("dragEnd", eventListener("dragEnd"));
  });

  for (const { name, x, y } of coords) {
    cy.get("html").trigger(name, x, y, { button: 0 });
  }

  return events;
}

context("Drags", (): void => {
  /*
   * The canvas starts at 200x200 and ends at 400x400.
   */
  describe("Inside → Inside → Inside", function (): void {
    let events: ReturnType<typeof drag>;

    it("Run", function (): void {
      cy.visit("http://localhost:58253/cypress/pages/events-target.html");

      events = drag([
        { name: "pointerover", x: 220, y: 220 },
        { name: "pointermove", x: 240, y: 245 },
        { name: "pointerdown", x: 240, y: 245 },
        { name: "pointermove", x: 260, y: 270 },
        { name: "pointermove", x: 280, y: 295 },
        { name: "pointermove", x: 300, y: 320 },
        { name: "pointermove", x: 320, y: 345 },
        { name: "pointermove", x: 340, y: 370 },
        { name: "pointerup", x: 360, y: 395 },
      ]);
    });

    it("Number of events", function (): void {
      expect(events).to.be.an("array").that.has.lengthOf(6);
    });

    it("Types", function (): void {
      expect(events.map(({ name }): string => name)).to.deep.equal([
        "dragStart",
        "dragging",
        "dragging",
        "dragging",
        "dragging",
        "dragEnd",
      ]);
    });

    it("Coordinates", function (): void {
      expect(events.map(({ event }): Point => event.pointer.DOM)).to.deep.equal(
        [
          { x: 40, y: 45 },
          { x: 80, y: 95 },
          { x: 100, y: 120 },
          { x: 120, y: 145 },
          { x: 140, y: 170 },
          { x: 160, y: 195 },
        ]
      );
    });
  });

  describe("Inside → Inside → Outside", function (): void {
    let events: ReturnType<typeof drag>;

    it("Run", function (): void {
      cy.visit("http://localhost:58253/cypress/pages/events-target.html");

      events = drag([
        { name: "pointerover", x: 220, y: 220 },
        { name: "pointermove", x: 240, y: 250 },
        { name: "pointerdown", x: 240, y: 250 },
        { name: "pointermove", x: 260, y: 300 },
        { name: "pointermove", x: 280, y: 350 },
        { name: "pointermove", x: 300, y: 400 },
        { name: "pointermove", x: 320, y: 450 },
        { name: "pointermove", x: 340, y: 500 },
        { name: "pointerup", x: 360, y: 500 },
      ]);
    });

    it("Number of events", function (): void {
      expect(events).to.be.an("array").that.has.lengthOf(6);
    });

    it("Types", function (): void {
      expect(events.map(({ name }): string => name)).to.deep.equal([
        "dragStart",
        "dragging",
        "dragging",
        "dragging",
        "dragging",
        "dragEnd",
      ]);
    });

    it("Coordinates", function (): void {
      expect(events.map(({ event }): Point => event.pointer.DOM)).to.deep.equal(
        [
          { x: 40, y: 50 },
          { x: 80, y: 150 },
          { x: 100, y: 200 },
          { x: 120, y: 250 },
          { x: 140, y: 300 },
          { x: 160, y: 300 },
        ]
      );
    });
  });

  const configs: { name: string; coords: Parameters<typeof drag>[0] }[] = [
    {
      name: "Outside → Outside → Outside",
      coords: [
        { name: "pointerover", x: 20, y: 220 },
        { name: "pointermove", x: 40, y: 245 },
        { name: "pointerdown", x: 40, y: 245 },
        { name: "pointermove", x: 60, y: 270 },
        { name: "pointermove", x: 80, y: 295 },
        { name: "pointermove", x: 100, y: 320 },
        { name: "pointermove", x: 120, y: 345 },
        { name: "pointermove", x: 140, y: 370 },
        { name: "pointerup", x: 160, y: 395 },
      ],
    },
    {
      name: "Outside → Inside → Inside",
      coords: [
        { name: "pointerover", x: 300, y: 100 },
        { name: "pointermove", x: 300, y: 150 },
        { name: "pointerdown", x: 300, y: 150 },
        { name: "pointermove", x: 300, y: 200 },
        { name: "pointermove", x: 300, y: 250 },
        { name: "pointermove", x: 300, y: 300 },
        { name: "pointermove", x: 300, y: 350 },
        { name: "pointerup", x: 300, y: 350 },
      ],
    },
    {
      name: "Outside → Inside → Outside",
      coords: [
        { name: "pointerover", x: 300, y: 100 },
        { name: "pointermove", x: 300, y: 150 },
        { name: "pointerdown", x: 300, y: 150 },
        { name: "pointermove", x: 300, y: 250 },
        { name: "pointermove", x: 300, y: 300 },
        { name: "pointermove", x: 300, y: 350 },
        { name: "pointermove", x: 300, y: 400 },
        { name: "pointermove", x: 300, y: 450 },
        { name: "pointerup", x: 300, y: 450 },
      ],
    },
  ];

  configs.forEach(({ name, coords }): void => {
    describe(name, function (): void {
      let events: ReturnType<typeof drag>;

      it("Run", function (): void {
        cy.visit("http://localhost:58253/cypress/pages/events-target.html");

        events = drag(coords);
      });

      it("No events", function (): void {
        expect(events).to.be.an("array").that.has.lengthOf(0);
      });
    });
  });
});
