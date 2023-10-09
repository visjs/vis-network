export * from "../../support/commands/types";

import { Edge, Node } from "../../../standalone";

export type TestData = { nodes: Node[]; edges: Edge[] };
export type VisEvent = any;

/**
 * X, Y point.
 */
export interface Point {
  x: number;
  y: number;
}

/**
 * Generate points to evenly space nodes into a grid around the center (0x0).
 *
 * @param amount - How many nodes.
 * @param size - How big is the (square) canvas.
 * @returns The points that can be spread into node options.
 */
export function createGridPoints(
  amount: number,
  size = 1000
): readonly Point[] {
  const perRowOrCol = Math.ceil(Math.sqrt(amount));
  const offset = (size * ((perRowOrCol - 1) / perRowOrCol)) / 2;

  return Object.freeze<Point[]>(
    new Array(amount).fill(null).map((_, i): Point => {
      const col = Math.floor(i / perRowOrCol);
      const row = i - col * perRowOrCol;

      return Object.freeze<Point>({
        x: (row / perRowOrCol) * size - offset,
        y: (col / perRowOrCol) * size - offset,
      });
    })
  );
}
