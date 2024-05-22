import commonjs from "@rollup/plugin-commonjs";
import nodeResolve from "@rollup/plugin-node-resolve";
import babel from "@rollup/plugin-babel";
import typescript from "rollup-plugin-typescript2";
import terser from "@rollup/plugin-terser";
import { generateHeader } from "vis-dev-utils";
import assets from "postcss-assets";
import postcss from "rollup-plugin-postcss";
import { BABEL_IGNORE_RE } from "vis-dev-utils";

// TypeScript because Babel transpiles modules in isolation, therefore no type reexports.
// CommonJS because Babel is not 100 % ESM.

const banner = generateHeader();

const plugins = {
  nodeResolve: nodeResolve({
    browser: true,
    extensions: [".ts", ".js", ".json"],
  }),
  typescript: typescript({
    tsconfig: "tsconfig.code.json",
  }),
  commonjs: commonjs(),
  babel: babel({
    extensions: [".ts", ".js"],
    babelHelpers: "runtime",
    exclude: BABEL_IGNORE_RE,
  }),
  minify: terser({
    output: {
      comments: (_node, { value }) => /@license/.test(value),
    },
  }),
  cssRaw: postcss({
    extract: "dist/vis-network.css",
    inject: false,
    minimize: false,
    sourceMap: false,
    plugins: [
      assets({
        loadPaths: ["lib/assets/"],
      }),
    ],
  }),
  cssMin: postcss({
    extract: "dist/vis-network.min.css",
    inject: false,
    minimize: true,
    sourceMap: false,
    plugins: [
      assets({
        loadPaths: ["lib/assets/"],
      }),
    ],
  }),
};

export default [
  {
    input: "lib/index-legacy-bundle.ts",
    output: [
      {
        file: "dist/vis-network.esm.js",
        format: "esm",
        banner,
        sourcemap: true,
      },
      {
        file: "dist/vis-network.js",
        format: "umd",
        exports: "named",
        name: "vis",
        extend: true,
        banner,
        sourcemap: true,
      },
    ],
    plugins: [
      plugins.commonjs,
      plugins.nodeResolve,
      plugins.cssRaw,
      plugins.typescript,
      plugins.babel,
    ],
  },
  {
    input: "lib/index-legacy-bundle.ts",
    output: [
      {
        file: "dist/vis-network.esm.min.js",
        format: "esm",
        banner,
        sourcemap: true,
      },
      {
        file: "dist/vis-network.min.js",
        format: "umd",
        exports: "named",
        name: "vis",
        extend: true,
        banner,
        sourcemap: true,
      },
    ],
    plugins: [
      plugins.commonjs,
      plugins.nodeResolve,
      plugins.cssMin,
      plugins.typescript,
      plugins.babel,
      plugins.minify,
    ],
  },
];
