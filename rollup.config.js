import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import typescript from 'rollup-plugin-typescript2';
import minify from 'rollup-plugin-babel-minify';
import genHeader from './lib/header';
import css from 'rollup-plugin-css-porter';

// TypeScript because Babel transpiles modules in isolation, therefore no type reexports.
// CommonJS because Babel is not 100 % ESM.

const plugins = {
	nodeResolve: nodeResolve({
		extensions: ['.ts', '.js', '.json']
	}),
	typescript: typescript({
		tsconfig: 'tsconfig.code.json'
	}),
	commonjs: commonjs(),
	babel: babel({
		extensions: ['.ts', '.js'],
		runtimeHelpers: true
	}),
	minify: minify({ comments: false }),
	cssRaw: css({
		raw: 'dist/vis-network.css',
		minified: false
	}),
	cssMin: css({
		raw: false,
		minified: 'dist/vis-network.min.css'
	})
}

export default [
	{
		input: 'lib/index-bundle.ts',
		output: [{
			file: 'dist/vis-network.esm.js',
			format: 'esm',
			banner: genHeader('network'),
			sourcemap: true
		}, {
			file: 'dist/vis-network.js',
			format: 'umd',
			exports: 'named',
			name: 'vis',
			extend: true,
			banner: genHeader('network'),
			sourcemap: true
		}],
		plugins: [
			plugins.commonjs,
			plugins.nodeResolve,
			plugins.cssRaw,
			plugins.typescript,
			plugins.babel
		]
	},
	{
		input: 'lib/index-bundle.ts',
		output: [{
			file: 'dist/vis-network.esm.min.js',
			format: 'esm',
			banner: genHeader('network'),
			sourcemap: true
		}, {
			file: 'dist/vis-network.min.js',
			format: 'umd',
			exports: 'named',
			name: 'vis',
			extend: true,
			banner: genHeader('network'),
			sourcemap: true
		}],
		plugins: [
			plugins.commonjs,
			plugins.nodeResolve,
			plugins.cssMin,
			plugins.typescript,
			plugins.babel,
			plugins.minify
		]
	}
]
