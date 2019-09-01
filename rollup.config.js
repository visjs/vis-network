import commonjs from "rollup-plugin-commonjs";
import nodeResolve from "rollup-plugin-node-resolve";
import babel from "rollup-plugin-babel";
import typescript from "rollup-plugin-typescript2";
import genHeader from "./lib/header";
import css from "rollup-plugin-css-porter";
import packageJSON from "./package.json";

// TypeScript because Babel transpiles modules in isolation, therefore no type reexports.
// CommonJS because Babel is not 100 % ESM.

export default [
  {
    fileSuffix: ".standalone",
    external: {},
    globals: {},
    input: "lib/index-standalone-bundle.ts"
  },
  {
    fileSuffix: ".peer",
    external: Object.keys(packageJSON.peerDependencies),
    globals: {
      keycharm: "keycharm",
      moment: "moment",
      "vis-data": "vis",
      "vis-util": "vis"
    },
    input: "lib/index-peer-bundle.ts"
  }
].flatMap(({ fileSuffix, external, globals, input }) => {
  return [
    {
      input,
      output: [
        {
          banner: genHeader("network"),
          file: `dist/esm${fileSuffix}.js`,
          format: "esm",
          sourcemap: true
        },
        {
          banner: genHeader("network"),
          exports: "named",
          extend: true,
          file: `dist/umd${fileSuffix}.js`,
          format: "umd",
          globals,
          name: "vis",
          sourcemap: true
        }
      ],
      external,
      plugins: [
        nodeResolve({
          extensions: [".ts", ".js", ".json"]
        }),
        typescript({
          tsconfig: "tsconfig.code.json"
        }),
        commonjs(),
        babel({
          extensions: [".ts", ".js"]
        }),
        css({
          raw: "dist/vis-network.css",
          minified: "dist/vis-network.min.css"
        })
      ]
    },
    {
      input: `dist/esm${fileSuffix}.js`,
      output: [
        {
          banner: genHeader("network"),
          file: `dist/esm${fileSuffix}.min.js`,
          format: "esm",
          sourcemap: true
        },
        {
          banner: genHeader("network"),
          exports: "named",
          extend: true,
          file: `dist/umd${fileSuffix}.min.js`,
          format: "umd",
          globals,
          name: "vis",
          sourcemap: true
        }
      ],
      external,
      plugins: [
        babel({
          extensions: [".ts", ".js"],
          babelrc: false,
          comments: false,
          presets: [
            [
              "minify",
              {
                builtIns: false
              }
            ]
          ]
        }),
        css({
          raw: false,
          minified: false
        })
      ]
    }
  ];
});
