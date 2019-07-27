/**
 * Setup a mock hammer.js object, for unit testing.
 *
 * Inspiration: https://github.com/uber/deck.gl/pull/658
 *
 * @returns {{on: noop, off: noop, destroy: noop, emit: noop, get: get}}
 */
function hammerMock() {
  const noop = () => {};

  return {
    on: noop,
    off: noop,
    destroy: noop,
    emit: noop,

    get: function(m) {	//eslint-disable-line no-unused-vars
      return {
        set: noop
      };
    }
  };
}


if (typeof window !== 'undefined') {
  var Hammer = window['Hammer'] || require('@egjs/hammerjs');
  module.exports = Hammer;
}
else {
  module.exports = function () {
    // hammer.js is only available in a browser, not in node.js. Replacing it with a mock object.
    return hammerMock();
  }
}
