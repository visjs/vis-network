import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import typescript from 'rollup-plugin-typescript2';
import minify from 'rollup-plugin-babel-minify';
import genHeader from './lib/header';
import css from 'rollup-plugin-css-porter';
import packageJSON from './package.json'

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

const options = [
	{
		externalName: '.standalone',
		external: {},
		globals: {},
		input: 'lib/index-standalone.ts',
	},
	{
		externalName: '.peer',
		external: Object.keys(packageJSON.peerDependencies),
		globals: {
			'keycharm': 'keycharm',
			'moment': 'moment',
			'vis-data': 'vis',
			'vis-util': 'vis',
		},
		input: 'lib/index-peer.ts',
	},
].flatMap(({ externalName, external, globals, input }) => {
	return [
		{
			pluginsName: '',
			plugins: [
				plugins.commonjs,
				plugins.nodeResolve,
				plugins.cssRaw,
				plugins.typescript,
				plugins.babel,
			],
		},
		{
			pluginsName: '.min',
			plugins: [
				plugins.commonjs,
				plugins.nodeResolve,
				plugins.cssMin,
				plugins.typescript,
				plugins.babel,
				plugins.minify,
			],
		},
	].flatMap(({ pluginsName, plugins }) => {
		return [
			{
				banner: genHeader('network'),
				file: `dist/esm${externalName}${pluginsName}.js`,
				format: 'esm',
				sourcemap: true,
			},
			{
				banner: genHeader('network'),
				exports: 'named',
				extend: true,
				file: `dist/umd${externalName}${pluginsName}.js`,
				format: 'umd',
				globals,
				name: 'vis',
				sourcemap: true,
			},
		].map(output => {
			return {
				input,
				output,
				external,
				plugins,
			}
		})
	})
})

export default [
	...options,
	{
		input: 'lib/index-standalone-bundle.ts',
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
		input: 'lib/index-standalone-bundle.ts',
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
