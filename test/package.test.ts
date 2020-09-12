import snapshot from "snap-shot-it";
import { inspectNpmPack } from "vis-dev-utils";

describe("Package", function (): void {
  it("Exported files", function (): void {
    this.timeout("5m");
    snapshot(inspectNpmPack());
  });
});
