import NO_FIXED_NO_POSITIONS from "./initial-positioning.no-fixed-no-positions.json";
import NO_FIXED_SOME_POSITIONS from "./initial-positioning.no-fixed-some-positions.json";
import SOME_FIXED_SOME_POSITIONS from "./initial-positioning.some-fixed-some-positions.json";

context("Initial positioning", (): void => {
  it("Nothing fixed, no positions", function (): void {
    cy.visSimpleCanvasSnapshot(
      "no-fixed-no-positions",
      { ...NO_FIXED_NO_POSITIONS },
      { requireNewerVersionThan: "8.3.0" }
    );
  });

  it("Nothing fixed, some positions", function (): void {
    cy.visSimpleCanvasSnapshot(
      "no-fixed-some-positions",
      { ...NO_FIXED_SOME_POSITIONS },
      { requireNewerVersionThan: "8.3.0" }
    );
  });

  it("Some fixed, some positions", function (): void {
    cy.visSimpleCanvasSnapshot(
      "some-fixed-some-positions",
      { ...SOME_FIXED_SOME_POSITIONS },
      { requireNewerVersionThan: "8.3.0" }
    );
  });
});
