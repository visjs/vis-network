import "./Activator.css";

import Emitter from "component-emitter";
import Hammer from "../module/hammer";

/**
 * Turn an element into an clickToUse element.
 * When not active, the element has a transparent overlay. When the overlay is
 * clicked, the mode is changed to active.
 * When active, the element is displayed with a blue border around it, and
 * the interactive contents of the element can be used. When clicked outside
 * the element, the elements mode is changed to inactive.
 *
 * @param {Element} container
 * @class Activator
 */
function Activator(container) {
  this._cleanupQueue = [];

  this.active = false;

  this._dom = {
    container,
    overlay: document.createElement("div"),
  };

  this._dom.overlay.classList.add("vis-overlay");

  this._dom.container.appendChild(this._dom.overlay);
  this._cleanupQueue.push(() => {
    this._dom.overlay.parentNode.removeChild(this._dom.overlay);
  });

  const hammer = Hammer(this._dom.overlay);
  hammer.on("tap", this._onTapOverlay.bind(this));
  this._cleanupQueue.push(() => {
    hammer.destroy();
    // FIXME: cleaning up hammer instances doesn't work (Timeline not removed
    // from memory)
  });

  // block all touch events (except tap)
  const events = [
    "tap",
    "doubletap",
    "press",
    "pinch",
    "pan",
    "panstart",
    "panmove",
    "panend",
  ];
  events.forEach((event) => {
    hammer.on(event, (event) => {
      event.srcEvent.stopPropagation();
    });
  });

  // attach a click event to the window, in order to deactivate when clicking outside the timeline
  if (document && document.body) {
    this._onClick = (event) => {
      if (!_hasParent(event.target, container)) {
        this.deactivate();
      }
    };
    document.body.addEventListener("click", this._onClick);
    this._cleanupQueue.push(() => {
      document.body.removeEventListener("click", this._onClick);
    });
  }

  // prepare escape key listener for deactivating when active
  this._escListener = (event) => {
    if (
      "key" in event
        ? event.key === "Escape"
        : event.keyCode === 27 /* the keyCode is for IE11 */
    ) {
      this.deactivate();
    }
  };
}

// turn into an event emitter
Emitter(Activator.prototype);

// The currently active activator
Activator.current = null;

/**
 * Destroy the activator. Cleans up all created DOM and event listeners
 */
Activator.prototype.destroy = function () {
  this.deactivate();

  for (const callback of this._cleanupQueue.splice(0).reverse()) {
    callback();
  }
};

/**
 * Activate the element
 * Overlay is hidden, element is decorated with a blue shadow border
 */
Activator.prototype.activate = function () {
  // we allow only one active activator at a time
  if (Activator.current) {
    Activator.current.deactivate();
  }
  Activator.current = this;

  this.active = true;
  this._dom.overlay.style.display = "none";
  this._dom.container.classList.add("vis-active");

  this.emit("change");
  this.emit("activate");

  // ugly hack: bind ESC after emitting the events, as the Network rebinds all
  // keyboard events on a 'change' event
  document.body.addEventListener("keydown", this._escListener);
};

/**
 * Deactivate the element
 * Overlay is displayed on top of the element
 */
Activator.prototype.deactivate = function () {
  this.active = false;
  this._dom.overlay.style.display = "block";
  this._dom.container.classList.remove("vis-active");
  document.body.removeEventListener("keydown", this._escListener);

  this.emit("change");
  this.emit("deactivate");
};

/**
 * Handle a tap event: activate the container
 *
 * @param {Event}  event   The event
 * @private
 */
Activator.prototype._onTapOverlay = function (event) {
  // activate the container
  this.activate();
  event.srcEvent.stopPropagation();
};

/**
 * Test whether the element has the requested parent element somewhere in
 * its chain of parent nodes.
 *
 * @param {HTMLElement} element
 * @param {HTMLElement} parent
 * @returns {boolean} Returns true when the parent is found somewhere in the
 *                    chain of parent nodes.
 * @private
 */
function _hasParent(element, parent) {
  while (element) {
    if (element === parent) {
      return true;
    }
    element = element.parentNode;
  }
  return false;
}

export default Activator;
export { Activator };
