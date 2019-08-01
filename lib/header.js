import moment from 'moment';
import pkg from '../package.json';

const header = `
${ pkg.homepage }

${ pkg.description }

@version ${ pkg.version }
@date    ${ moment().utc().format() }

@copyright (c) 2011-2017 Almende B.V, http://almende.com
@copyright (c) 2018-2019 visjs contributors, https://github.com/visjs

@license 
vis.js is dual licensed under both

  1. The Apache 2.0 License
     http://www.apache.org/licenses/LICENSE-2.0

  and

  2. The MIT License
     http://opensource.org/licenses/MIT

vis.js may be distributed under either license.`;

/**
 * Generate a dynamic header banner.
 * 
 * @param {String} component 
 * @returns {String} banner
 */
function genHeader(component) {
   return '/**\n' + [
      pkg.name,
      component ? ' - ' + component : '',
      header
   ].join('')
   .replace(/^(?!\n)/gm, ' * ')
   .replace(/^(?=\n)/gm, ' *') + '\n */';
}

export default genHeader;
