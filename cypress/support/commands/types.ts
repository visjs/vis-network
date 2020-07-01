import {
  DataSetEdges,
  DataSetNodes,
  Network
} from "../../../declarations/entry-standalone";

// TODO: Convert this to type only export when ESLint and Prettier support the
// suntax. This way all the code is available even though it's never used.
export * from "../../../standalone";

export interface VisGlobals {
  edges: DataSetEdges;
  lastEvents: Record<string, any>;
  network: Network;
  nodes: DataSetNodes;
}

export interface Point {
  x: number;
  y: number;
}

export interface DragPath {
  from: Point;
  to: Point;

  button?: number;

  shiftKey?: boolean;
}
