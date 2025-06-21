import { BABEL_IGNORE_RE } from "vis-dev-utils";
import babelPreset from "vis-dev-utils/babel-preset";

export default {
  exclude: BABEL_IGNORE_RE,
  presets: [[babelPreset, { css: true, ts: true }]],
};
