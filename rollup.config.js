import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import typescript from 'rollup-plugin-typescript2';
import minify from 'rollup-plugin-babel-minify';
import genHeader from './lib/header';

// TypeScript because Babel transpiles modules in isolation, therefore no type reexports.
// CommonJS because Babel is not 100 % ESM.

const plugins = [
	nodeResolve({
		extensions: ['.ts', '.js', '.json']
	}),
	typescript({
		tsconfig: 'tsconfig.code.json'
	}),
	commonjs(),
	babel({
		extensions: ['.ts', '.js'],
		runtimeHelpers: true
	})
]
const minPlugins = [
	...plugins.slice(),
	minify({ comments: false })
]

export default [
	{
		input: 'lib/index-bundle.ts',
		output: {
			file: 'dist/vis-network.esm.js',
			format: 'esm',
			banner: genHeader('network'),
			sourcemap: true
		},
		plugins
	},
	{
		input: 'lib/index-bundle.ts',
		output: {
			file: 'dist/vis-network.js',
			format: 'umd',
			exports: 'named',
			name: 'vis',
			banner: genHeader('network'),
			sourcemap: true
		},
		plugins
	},
	{
		input: 'lib/index-bundle.ts',
		output: {
			file: 'dist/vis-network.esm.min.js',
			format: 'esm',
			banner: genHeader('network'),
			sourcemap: true
		},
		plugins: minPlugins
	},
	{
		input: 'lib/index-bundle.ts',
		output: {
			file: 'dist/vis-network.min.js',
			format: 'umd',
			exports: 'named',
			name: 'vis',
			banner: genHeader('network'),
			sourcemap: true
		},
		plugins: minPlugins,
	}
]
