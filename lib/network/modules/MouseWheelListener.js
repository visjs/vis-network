/*
    Auto detects which wheel listener is supported by
    the current browser, and normalizes the event to
    the modern 'wheel' api
*/

let prefix = "",
_addEventListener,
onWheel,
support;

if (window.addEventListener) {
    _addEventListener = 'addEventListener';
} else {
    _addEventListener = 'attachEvent';
    prefix = "on";
}

support = 
    "onwheel" in document.createElement("div")
    ? "wheel"
    : document.onmousewheel !== undefined
    ? "mousewheel"
    : "DOMMouseScroll";

// Takes in an element to add the listener to, callback and boolean to capture the event or not
export function addWheelListener(elem, callback, useCapture) {
    _addWheelListener(elem, support, callback, useCapture);

    if (support == 'DOMMouseScroll') {
        _addWheelListener(elem, 'MozMousePixelScroll', callback, useCapture);
    }
}

function _addWheelListener(elem, eventName, callback, useCapture) {
    elem[_addEventListener](
        prefix + eventName,
        support === 'wheel'
        ? callback
        : function(originalEvent) {
            !originalEvent && (originalEvent = window.event);

            let event = {
                originalEvent: originalEvent,
                target: originalEvent.target || originalEvent.srcElement,
                type: "wheel",
                deltaMode: originalEvent.type === "MozMousePixelScroll" ? 0 : 1,
                deltaX: 0,
                deltaY: 0,
                preventDefault: function() {
                    originalEvent.preventDefault
                    ? originalEvent.preventDefault()
                    : (originalEvent.returnValue = false);
                }
            };

            if (support === 'mousewheel') {
                event.deltaY = (-1 / 40) * originalEvent.wheelDelta;
                originalEvent.wheelDeltaX &&
                (event.deltaX = (-1 / 40) * originalEvent.wheelDeltaX);
            } else {
                event.deltaY = originalEvent.detail;
            }

            return callback(event);
        }
    )
}