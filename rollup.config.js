import commonjs from 'rollup-plugin-commonjs'
import resolve from 'rollup-plugin-node-resolve'
import babel from 'rollup-plugin-babel'
import typescript from 'rollup-plugin-typescript2'
import banner from 'rollup-plugin-banner'
import genHeader from './lib/header'

// TypeScript because Babel transpiles modules in isolation, therefore no type reexports.
// CommonJS because Babel is not 100 % ESM.

const babelConfingBase = {
  extensions: ['.ts', '.js'],
  runtimeHelpers: true,
}
const resolveConfig = {
  extensions: [...babelConfingBase.extensions, '.json'],
}
const bannerConfig = genHeader('network')
const typescriptConfig = {
  tsconfig: 'tsconfig.code.json',
}

export default [
  {
    input: 'lib/index.ts',
    output: {
      file: 'dist/esm.js',
      format: 'esm',
    },
    plugins: [
      resolve(resolveConfig),
      typescript(typescriptConfig),
      commonjs(),
      babel(babelConfingBase),
      banner(bannerConfig),
    ],
  },
  {
    input: 'lib/index.ts',
    output: {
      file: 'dist/umd.js',
      format: 'umd',
      exports: 'named',
      name: 'vis',
    },
    plugins: [
      resolve(resolveConfig),
      typescript(typescriptConfig),
      commonjs(),
      babel(babelConfingBase),
      banner(bannerConfig),
    ],
  },
]
