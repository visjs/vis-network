/**
 * Adds layout seed to Network unless supplied explicitly. The intention here
 * is to make the layout stable that is to keep the layout the same on every
 * screenshot.
 */
(() => {
  window.vis = {};
  let Network = undefined;

  Object.defineProperty(window.vis, "Network", {
    get() {
      return function StableNetwork(container, data, options, ...args) {
        options = options || {};
        options.layout = options.layout || {};
        options.layout.randomSeed = options.layout.randomSeed || 0;
        return new Network(container, data, options, ...args);
      };
    },
    set(value) {
      Network = value;
    }
  });
})();
