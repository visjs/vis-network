import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';
import nodeBuiltins from 'rollup-plugin-node-builtins';
import babel from 'rollup-plugin-babel';
import sourcemaps from 'rollup-plugin-sourcemaps';
import { uglify } from "rollup-plugin-uglify";
import banner from 'rollup-plugin-banner';
import genHeader from './lib/header';

const genSourceMap = false;

export default [{
	input: 'index.js',
	output: {
		file: 'dist/vis-network.min.js',
		name: 'vis',
		exports: 'named',
		format: 'umd',
		sourcemap: genSourceMap
	},
	plugins: [
		commonjs(),
		nodeBuiltins(),
		nodeResolve(),
		babel(),
		sourcemaps(),
		uglify({
			sourcemap: genSourceMap
		}),
		banner(genHeader('network'))
	]
}]
