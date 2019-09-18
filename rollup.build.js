import assets from "postcss-assets";
import babel from "rollup-plugin-babel";
import commonjs from "rollup-plugin-commonjs";
import copy from "rollup-plugin-copy";
import genHeader from "./dev-lib/header";
import nodeResolve from "rollup-plugin-node-resolve";
import packageJSON from "./package.json";
import postcss from "rollup-plugin-postcss";
import typescript from "rollup-plugin-typescript2";
import { readFileSync } from "fs";
import { terser } from "rollup-plugin-terser";

const babelrc = JSON.parse(readFileSync("./.babelrc"));
const banner = genHeader("network");

export default [
  {
    external: {},
    globals: {},
    injectCSS: true,
    input: "lib/index-standalone.ts",
    variant: "standalone"
  },
  {
    external: Object.keys(packageJSON.peerDependencies),
    globals: {
      keycharm: "keycharm",
      moment: "moment",
      "vis-data": "vis",
      "vis-util": "vis"
    },
    injectCSS: false,
    input: "lib/index-peer.ts",
    variant: "peer"
  }
].flatMap(({ external, globals, injectCSS, input, variant }) => {
  return [false, true].flatMap(min => {
    const esmFileWithoutExt = `${variant}/esm/vis-network${min ? ".min" : ""}`;
    const umdFileWithoutExt = `${variant}/umd/vis-network${min ? ".min" : ""}`;

    return [
      {
        input,
        output: [
          {
            banner,
            file: esmFileWithoutExt + ".js",
            format: "esm",
            sourcemap: true
          },
          {
            banner,
            exports: "named",
            extend: true,
            file: umdFileWithoutExt + ".js",
            format: "umd",
            globals,
            name: "vis",
            sourcemap: true
          }
        ],
        external,
        plugins: [
          copy({
            targets: [
              {
                src: `./dev-lib/bundle-${variant}.d.ts`,
                dest: ".",
                rename: esmFileWithoutExt + ".d.ts"
              },
              {
                src: `./dev-lib/bundle-${variant}.d.ts`,
                dest: ".",
                rename: umdFileWithoutExt + ".d.ts"
              }
            ]
          }),
          nodeResolve({
            extensions: [".ts", ".js", ".json"]
          }),
          typescript({
            objectHashIgnoreUnknownHack: true,
            tsconfig: "tsconfig.code.json"
          }),
          commonjs(),
          babel({
            ...babelrc,
            babelrc: false,
            extensions: [".ts", ".js"],
            exclude: [/node_modules[\/\\]core-js/]
          }),
          postcss({
            extract: !injectCSS && `styles/vis-network${min ? ".min" : ""}.css`,
            inject: injectCSS,
            minimize: min,
            sourceMap: true,
            plugins: [
              assets({
                loadPaths: ["lib/assets/"]
              })
            ]
          }),
          ...(!min
            ? []
            : [
                terser({
                  output: {
                    comments: (_node, { value }) => /@license/.test(value)
                  }
                })
              ])
        ]
      }
    ];
  });
});
