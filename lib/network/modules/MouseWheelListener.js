/*
    Auto detects which wheel listener is supported by
    the current browser, and normalizes the event to
    the modern 'wheel' api
*/

let prefix = "",
_addEventListener,
support;

if (window.addEventListener) {
    _addEventListener = 'addEventListener';
} else {
    _addEventListener = 'attachEvent';
    prefix = "on";
}

support = 
    "onwheel" in document.createElement("div")
    ? "wheel" : null;

// Takes in an element to add the listener to, callback and boolean to capture the event or not
export function addWheelListener(elem, callback, useCapture) {
    if (support) {
        _addWheelListener(elem, support, callback, useCapture);
    }
}

function _addWheelListener(elem, eventName, callback, useCapture) {
    elem[_addEventListener](
        prefix + eventName,
        callback
    )
}