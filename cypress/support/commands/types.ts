import type {
  DataSetEdges,
  DataSetNodes,
  Network,
  NetworkEvents,
  Options,
} from "../../../declarations/entry-standalone";

// TODO: Convert this to type only export when ESLint and Prettier support the
// syntax. This way all the code is available even though it's never used.
export * from "../../../standalone";

export interface VisGlobals {
  edges: DataSetEdges;
  eventQueue: Record<NetworkEvents, { params: any }[]>;
  lastEvents: Record<string, any>;
  network: Network;
  nodes: DataSetNodes;
}

export type VisWindow = {
  visEdges: VisGlobals["edges"];
  visEventQueue: VisGlobals["eventQueue"];
  visLastEvents: VisGlobals["lastEvents"];
  visNetwork: VisGlobals["network"];
  visNodes: VisGlobals["nodes"];
};

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

export interface UniversalNetworkConfig {
  edges?: any[];
  nodes?: any[];
  options?: Options;

  manipulation?: boolean;
  physics?: boolean;
}
export interface UniversalConfig extends UniversalNetworkConfig {
  version: null | "latest";
}

export type IdType = string | number;
