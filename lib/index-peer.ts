// Network.
export * from "./network/Network";

import Images from "./network/Images";
import * as dotparser from "./network/dotparser";
import * as gephiParser from "./network/gephiParser";
import { parseGephi } from "./network/gephiParser";
import * as allOptions from "./network/options";
export const network = {
  Images,
  dotparser,
  gephiParser,
  allOptions,
  convertDot: dotparser.DOTToGraph,
  convertGephi: parseGephi
};

// utils
import * as DOMutil from "./DOMutil";
export { DOMutil };
