/**
 * Register a touch event, taking place before a gesture
 *
 * @param {Hammer} hammer       A hammer instance
 * @param {Function} callback   Callback, called as callback(event)
 */
export function onTouch(hammer, callback) {
  callback.inputHandler = function (event) {
    if (event.isFirst) {
      callback(event);
    }
  };

  hammer.on("hammer.input", callback.inputHandler);
}

/**
 * Register a release event, taking place after a gesture
 *
 * @param {Hammer} hammer       A hammer instance
 * @param {Function} callback   Callback, called as callback(event)
 * @returns {*}
 */
export function onRelease(hammer, callback) {
  callback.inputHandler = function (event) {
    if (event.isFinal) {
      callback(event);
    }
  };

  return hammer.on("hammer.input", callback.inputHandler);
}

/**
 * Unregister a touch event, taking place before a gesture
 *
 * @param {Hammer} hammer       A hammer instance
 * @param {Function} callback   Callback, called as callback(event)
 */
export function offTouch(hammer, callback) {
  hammer.off("hammer.input", callback.inputHandler);
}

/**
 * Unregister a release event, taking place before a gesture
 *
 * @param {Hammer} hammer       A hammer instance
 * @param {Function} callback   Callback, called as callback(event)
 */
export const offRelease = offTouch;

/**
 * Hack the PinchRecognizer such that it doesn't prevent default behavior
 * for vertical panning.
 *
 * Yeah ... this is quite a hack ... see https://github.com/hammerjs/hammer.js/issues/932
 *
 * @param {Hammer.Pinch} pinchRecognizer
 * @returns {Hammer.Pinch} returns the pinchRecognizer
 */
export function disablePreventDefaultVertically(pinchRecognizer) {
  const TOUCH_ACTION_PAN_Y = "pan-y";

  pinchRecognizer.getTouchAction = function () {
    // default method returns [TOUCH_ACTION_NONE]
    return [TOUCH_ACTION_PAN_Y];
  };

  return pinchRecognizer;
}
