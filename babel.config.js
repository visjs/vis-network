import babelPreset from "vis-dev-utils/babel-preset";

import { BABEL_IGNORE_RE } from "vis-dev-utils";

export default {
  exclude: BABEL_IGNORE_RE,
  presets: [[babelPreset, { css: true, ts: true }]],
};
