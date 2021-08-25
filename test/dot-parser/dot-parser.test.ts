import { expect } from "chai";

import { readFileSync, readdirSync } from "fs";

import { DOTToGraph, parseDOT } from "../../lib/network/dotparser";

describe("DOT", function (): void {
  const dotRE = /\.gv\.txt$/i;

  readdirSync(`${__dirname}/data`)
    .filter((dotName): boolean => dotRE.test(dotName))
    .map(
      (
        dotName
      ): {
        name: string;
        dot: string;
        parseDOTObject: any;
        dotToGraphObject: any;
      } => {
        const name = dotName.slice(0, -7);
        const pathHead = `${__dirname}/data/${name}`;

        const dotPath = `${pathHead}.gv.txt`;
        const parseDOTPath = `${pathHead}.parse-dot.json`;
        const dotToGraphPath = `${pathHead}.dot-to-graph.json`;

        /*
         * Update this test after changes (make sure the changes are correct).
         */
        // writeFileSync(
        //   parseDOTPath,
        //   JSON.stringify(parseDOT(readFileSync(dotPath, 'utf8')), undefined, 4)
        // )
        // writeFileSync(
        //   dotToGraphPath,
        //   JSON.stringify(
        //     DOTToGraph(readFileSync(dotPath, 'utf8')),
        //     undefined,
        //     4
        //   )
        // )

        return {
          name,
          dot: readFileSync(dotPath, "utf8"),
          parseDOTObject: JSON.parse(readFileSync(parseDOTPath, "utf8")),
          dotToGraphObject: JSON.parse(readFileSync(dotToGraphPath, "utf8")),
        };
      }
    )
    .forEach(({ name, dot, parseDOTObject, dotToGraphObject }): void => {
      describe(name, function (): void {
        it("parseDOT", function (): void {
          const parsedObject = parseDOT(dot);
          const cleanObject = JSON.parse(JSON.stringify(parsedObject));
          expect(cleanObject).to.deep.equal(parseDOTObject);
        });

        it("DOTToGraph", function (): void {
          const parsedObject = DOTToGraph(dot);
          const cleanObject = JSON.parse(JSON.stringify(parsedObject));
          expect(cleanObject).to.deep.equal(dotToGraphObject);
        });
      });
    });
});
