import { expect } from "chai";

import { configureOptions } from "../lib/network/options";

/**
 * Traverse the root and test all the nested options.
 *
 * @param root - An object containing potentially nested configure options.
 * @param rootPath - The path that was used to get to the root. Can be omitted
 * if the root is the top level object.
 */
function traverseCO(root: any, rootPath: string[] = []): void {
  const impreciseNumberPS =
    " (There's some wiggle room due to the fact that floating point numbers are not absolutely precise hence the unreadable test.)";

  Object.entries(root).forEach(([key, value]): void => {
    const path = [...rootPath, key];

    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      traverseCO(value, path);
    } else {
      it(path.join("."), function (): void {
        if (Array.isArray(value) && typeof value[0] === "number") {
          expect(
            value,
            "Range has to have the format [initial, min, max, step]."
          ).to.have.lengthOf(4);
          expect(
            typeof value[0] === "number" &&
              typeof value[1] === "number" &&
              typeof value[2] === "number" &&
              typeof value[3] === "number",
            "All the values in range have to be numbers."
          ).to.be.true;

          const [initial, min, max, step] = value;
          expect(
            min,
            "The minimum has to be less than the maximum."
          ).to.be.lessThan(max);
          expect(step, "The step can't exceed the range.").to.be.lessThan(
            max - min
          );
          expect(initial, "The initial value has to be within the range.")
            .to.be.at.most(max)
            .and.at.least(min);
          expect(
            ((initial - min) / step) % 1,
            "The initial value has to be at one of the steps." +
              impreciseNumberPS
          ).to.not.be.approximately(0.5, 0.499999999);
          expect(
            ((max - min) / step) % 1,
            "Both the min and max have to be reachable by the step." +
              impreciseNumberPS
          ).to.not.be.approximately(0.5, 0.499999999);
        } else if (Array.isArray(value) && value[0] === "color") {
          expect(
            value,
            "There has to be an initial color after the color keyword."
          ).to.to.have.lengthOf(2);

          expect(value, "All values have to be color strings.").to.satisfy(
            (value: unknown[]): boolean =>
              value.every((v): boolean => typeof v === "string")
          );
        } else if (Array.isArray(value) && typeof value[0] === "string") {
          expect(
            value,
            "Only strings, numbers and booleans are allowed in dropdown menus."
          ).to.satisfy((value: unknown[]): boolean =>
            value.every(
              (v): boolean =>
                typeof v === "string" ||
                typeof v === "number" ||
                typeof v === "boolean"
            )
          );
        } else if (typeof value === "boolean" || typeof value === "string") {
          // No problems here.
        } else {
          expect.fail(`Unrecognized format: ${JSON.stringify(value)}`);
        }
      });
    }
  });
}

describe("Configure Options", function (): void {
  traverseCO(configureOptions);
});
