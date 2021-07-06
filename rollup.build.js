import packageJSON from "./package.json";
import { generateRollupConfiguration } from "vis-dev-utils";

export default generateRollupConfiguration({
  assets: "./lib/assets",
  externalForPeerBuild: ["vis-data"],
  globals: {
    "@egjs/hammerjs": "Hammer",
    "component-emitter": "Emitter",
    "vis-data": "vis",
    "vis-util": "vis",
    keycharm: "keycharm",
    timsort: "timsort",
    uuid: "uuid",
  },
  header: { name: "vis-network" },
  libraryFilename: "vis-network",
  entryPoints: "./lib",
  packageJSON,
  tsconfig: "tsconfig.code.json",
});
