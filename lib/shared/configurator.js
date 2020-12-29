import "./configurator.css";

import { copyAndExtendArray } from "vis-util/esnext";

import { ColorPicker } from "./color-picker";

/**
 * Wrap given text (last argument) in HTML elements (all preceding arguments).
 *
 * @param {...any} rest - List of tag names followed by inner text.
 *
 * @returns An element or a text node.
 */
function wrapInTag(...rest) {
  if (rest.length < 1) {
    throw new TypeError("Invalid arguments.");
  } else if (rest.length === 1) {
    return document.createTextNode(rest[0]);
  } else {
    const element = document.createElement(rest[0]);
    element.appendChild(wrapInTag(rest.slice(1)));
    return element;
  }
}

/**
 * The way this works is for all properties of this.possible options, you can supply the property name in any form to list the options.
 * Boolean options are recognised as Boolean
 * Number options should be written as array: [default value, min value, max value, stepsize]
 * Colors should be written as array: ['color', '#ffffff']
 * Strings with should be written as array: [option1, option2, option3, ..]
 *
 * The options are matched with their counterparts in each of the modules and the values used in the configuration are
 */
export class Configurator {
  /**
   * @param {object} parentModule        | the location where parentModule.setOptions() can be called
   * @param {object} defaultContainer    | the default container of the module
   * @param {object} configureOptions    | the fully configured and predefined options set found in allOptions.js
   * @param {number} pixelRatio          | canvas pixel ratio
   */
  constructor(
    parentModule,
    defaultContainer,
    configureOptions,
    pixelRatio = 1
  ) {
    this.parent = parentModule;
    this.changedOptions = [];
    this.container = defaultContainer;
    this.allowCreation = false;

    this.options = {};
    this.initialized = false;
    this.popupCounter = 0;
    this.defaultOptions = {
      enabled: false,
      filter: true,
      container: undefined,
      showButton: true,
    };
    Object.assign(this.options, this.defaultOptions);

    this.configureOptions = configureOptions;
    this.moduleOptions = {};
    this.domElements = [];
    this.popupDiv = {};
    this.popupLimit = 5;
    this.popupHistory = {};
    this.colorPicker = new ColorPicker(pixelRatio);
    this.wrapper = undefined;
  }

  /**
   * refresh all options.
   * Because all modules parse their options by themselves, we just use their options. We copy them here.
   *
   * @param {object} options
   */
  setOptions(options) {
    if (options !== undefined) {
      // reset the popup history because the indices may have been changed.
      this.popupHistory = {};
      this._removePopup();

      let enabled = true;
      if (typeof options === "string") {
        this.options.filter = options;
      } else if (Array.isArray(options)) {
        this.options.filter = options.join();
      } else if (typeof options === "object") {
        if (options == null) {
          throw new TypeError("options cannot be null");
        }
        if (options.container !== undefined) {
          this.options.container = options.container;
        }
        if (options.filter !== undefined) {
          this.options.filter = options.filter;
        }
        if (options.showButton !== undefined) {
          this.options.showButton = options.showButton;
        }
        if (options.enabled !== undefined) {
          enabled = options.enabled;
        }
      } else if (typeof options === "boolean") {
        this.options.filter = true;
        enabled = options;
      } else if (typeof options === "function") {
        this.options.filter = options;
        enabled = true;
      }
      if (this.options.filter === false) {
        enabled = false;
      }

      this.options.enabled = enabled;
    }
    this._clean();
  }

  /**
   *
   * @param {object} moduleOptions
   */
  setModuleOptions(moduleOptions) {
    this.moduleOptions = moduleOptions;
    if (this.options.enabled === true) {
      this._clean();
      if (this.options.container !== undefined) {
        this.container = this.options.container;
      }
      this._create();
    }
  }

  /**
   * Create all DOM elements
   *
   * @private
   */
  _create() {
    this._clean();
    this.changedOptions = [];

    const filter = this.options.filter;
    let counter = 0;
    let show = false;
    for (const option in this.configureOptions) {
      if (Object.prototype.hasOwnProperty.call(this.configureOptions, option)) {
        this.allowCreation = false;
        show = false;
        if (typeof filter === "function") {
          show = filter(option, []);
          show =
            show ||
            this._handleObject(this.configureOptions[option], [option], true);
        } else if (filter === true || filter.indexOf(option) !== -1) {
          show = true;
        }

        if (show !== false) {
          this.allowCreation = true;

          // linebreak between categories
          if (counter > 0) {
            this._makeItem([]);
          }
          // a header for the category
          this._makeHeader(option);

          // get the sub options
          this._handleObject(this.configureOptions[option], [option]);
        }
        counter++;
      }
    }
    this._makeButton();
    this._push();
    //~ this.colorPicker.insertTo(this.container);
  }

  /**
   * draw all DOM elements on the screen
   *
   * @private
   */
  _push() {
    this.wrapper = document.createElement("div");
    this.wrapper.className = "vis-configuration-wrapper";
    this.container.appendChild(this.wrapper);
    for (let i = 0; i < this.domElements.length; i++) {
      this.wrapper.appendChild(this.domElements[i]);
    }

    this._showPopupIfNeeded();
  }

  /**
   * delete all DOM elements
   *
   * @private
   */
  _clean() {
    for (let i = 0; i < this.domElements.length; i++) {
      this.wrapper.removeChild(this.domElements[i]);
    }

    if (this.wrapper !== undefined) {
      this.container.removeChild(this.wrapper);
      this.wrapper = undefined;
    }
    this.domElements = [];

    this._removePopup();
  }

  /**
   * get the value from the actualOptions if it exists
   *
   * @param {Array} path    | where to look for the actual option
   * @returns {*}
   * @private
   */
  _getValue(path) {
    let base = this.moduleOptions;
    for (let i = 0; i < path.length; i++) {
      if (base[path[i]] !== undefined) {
        base = base[path[i]];
      } else {
        base = undefined;
        break;
      }
    }
    return base;
  }

  /**
   * all option elements are wrapped in an item
   *
   * @param {Array} path    | where to look for the actual option
   * @param {Array.<Element>} domElements
   * @returns {number}
   * @private
   */
  _makeItem(path, ...domElements) {
    if (this.allowCreation === true) {
      const item = document.createElement("div");
      item.className =
        "vis-configuration vis-config-item vis-config-s" + path.length;
      domElements.forEach((element) => {
        item.appendChild(element);
      });
      this.domElements.push(item);
      return this.domElements.length;
    }
    return 0;
  }

  /**
   * header for major subjects
   *
   * @param {string} name
   * @private
   */
  _makeHeader(name) {
    const div = document.createElement("div");
    div.className = "vis-configuration vis-config-header";
    div.innerText = name;
    this._makeItem([], div);
  }

  /**
   * make a label, if it is an object label, it gets different styling.
   *
   * @param {string} name
   * @param {Array} path    | where to look for the actual option
   * @param {string} objectLabel
   * @returns {HTMLElement}
   * @private
   */
  _makeLabel(name, path, objectLabel = false) {
    const div = document.createElement("div");
    div.className =
      "vis-configuration vis-config-label vis-config-s" + path.length;
    if (objectLabel === true) {
      while (div.firstChild) {
        div.removeChild(div.firstChild);
      }
      div.appendChild(wrapInTag("i", "b", name));
    } else {
      div.innerText = name + ":";
    }
    return div;
  }

  /**
   * make a dropdown list for multiple possible string optoins
   *
   * @param {Array.<number>} arr
   * @param {number} value
   * @param {Array} path    | where to look for the actual option
   * @private
   */
  _makeDropdown(arr, value, path) {
    const select = document.createElement("select");
    select.className = "vis-configuration vis-config-select";
    let selectedValue = 0;
    if (value !== undefined) {
      if (arr.indexOf(value) !== -1) {
        selectedValue = arr.indexOf(value);
      }
    }

    for (let i = 0; i < arr.length; i++) {
      const option = document.createElement("option");
      option.value = arr[i];
      if (i === selectedValue) {
        option.selected = "selected";
      }
      option.innerText = arr[i];
      select.appendChild(option);
    }

    const me = this;
    select.onchange = function () {
      me._update(this.value, path);
    };

    const label = this._makeLabel(path[path.length - 1], path);
    this._makeItem(path, label, select);
  }

  /**
   * make a range object for numeric options
   *
   * @param {Array.<number>} arr
   * @param {number} value
   * @param {Array} path    | where to look for the actual option
   * @private
   */
  _makeRange(arr, value, path) {
    const defaultValue = arr[0];
    const min = arr[1];
    const max = arr[2];
    const step = arr[3];
    const range = document.createElement("input");
    range.className = "vis-configuration vis-config-range";
    try {
      range.type = "range"; // not supported on IE9
      range.min = min;
      range.max = max;
    } catch (err) {
      // TODO: Add some error handling.
    }
    range.step = step;

    // set up the popup settings in case they are needed.
    let popupString = "";
    let popupValue = 0;

    if (value !== undefined) {
      const factor = 1.2;
      if (value < 0 && value * factor < min) {
        range.min = Math.ceil(value * factor);
        popupValue = range.min;
        popupString = "range increased";
      } else if (value / factor < min) {
        range.min = Math.ceil(value / factor);
        popupValue = range.min;
        popupString = "range increased";
      }
      if (value * factor > max && max !== 1) {
        range.max = Math.ceil(value * factor);
        popupValue = range.max;
        popupString = "range increased";
      }
      range.value = value;
    } else {
      range.value = defaultValue;
    }

    const input = document.createElement("input");
    input.className = "vis-configuration vis-config-rangeinput";
    input.value = range.value;

    const me = this;
    range.onchange = function () {
      input.value = this.value;
      me._update(Number(this.value), path);
    };
    range.oninput = function () {
      input.value = this.value;
    };

    const label = this._makeLabel(path[path.length - 1], path);
    const itemIndex = this._makeItem(path, label, range, input);

    // if a popup is needed AND it has not been shown for this value, show it.
    if (popupString !== "" && this.popupHistory[itemIndex] !== popupValue) {
      this.popupHistory[itemIndex] = popupValue;
      this._setupPopup(popupString, itemIndex);
    }
  }

  /**
   * make a button object
   *
   * @private
   */
  _makeButton() {
    if (this.options.showButton === true) {
      const generateButton = document.createElement("div");
      generateButton.className = "vis-configuration vis-config-button";
      generateButton.innerText = "generate options";
      generateButton.onclick = () => {
        this._printOptions();
      };
      generateButton.onmouseover = () => {
        generateButton.className = "vis-configuration vis-config-button hover";
      };
      generateButton.onmouseout = () => {
        generateButton.className = "vis-configuration vis-config-button";
      };

      this.optionsContainer = document.createElement("div");
      this.optionsContainer.className =
        "vis-configuration vis-config-option-container";

      this.domElements.push(this.optionsContainer);
      this.domElements.push(generateButton);
    }
  }

  /**
   * prepare the popup
   *
   * @param {string} string
   * @param {number} index
   * @private
   */
  _setupPopup(string, index) {
    if (
      this.initialized === true &&
      this.allowCreation === true &&
      this.popupCounter < this.popupLimit
    ) {
      const div = document.createElement("div");
      div.id = "vis-configuration-popup";
      div.className = "vis-configuration-popup";
      div.innerText = string;
      div.onclick = () => {
        this._removePopup();
      };
      this.popupCounter += 1;
      this.popupDiv = { html: div, index: index };
    }
  }

  /**
   * remove the popup from the dom
   *
   * @private
   */
  _removePopup() {
    if (this.popupDiv.html !== undefined) {
      this.popupDiv.html.parentNode.removeChild(this.popupDiv.html);
      clearTimeout(this.popupDiv.hideTimeout);
      clearTimeout(this.popupDiv.deleteTimeout);
      this.popupDiv = {};
    }
  }

  /**
   * Show the popup if it is needed.
   *
   * @private
   */
  _showPopupIfNeeded() {
    if (this.popupDiv.html !== undefined) {
      const correspondingElement = this.domElements[this.popupDiv.index];
      const rect = correspondingElement.getBoundingClientRect();
      this.popupDiv.html.style.left = rect.left + "px";
      this.popupDiv.html.style.top = rect.top - 30 + "px"; // 30 is the height;
      document.body.appendChild(this.popupDiv.html);
      this.popupDiv.hideTimeout = setTimeout(() => {
        this.popupDiv.html.style.opacity = 0;
      }, 1500);
      this.popupDiv.deleteTimeout = setTimeout(() => {
        this._removePopup();
      }, 1800);
    }
  }

  /**
   * make a checkbox for boolean options.
   *
   * @param {number} defaultValue
   * @param {number} value
   * @param {Array} path    | where to look for the actual option
   * @private
   */
  _makeCheckbox(defaultValue, value, path) {
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "vis-configuration vis-config-checkbox";
    checkbox.checked = defaultValue;
    if (value !== undefined) {
      checkbox.checked = value;
      if (value !== defaultValue) {
        if (typeof defaultValue === "object") {
          if (value !== defaultValue.enabled) {
            this.changedOptions.push({ path: path, value: value });
          }
        } else {
          this.changedOptions.push({ path: path, value: value });
        }
      }
    }

    const me = this;
    checkbox.onchange = function () {
      me._update(this.checked, path);
    };

    const label = this._makeLabel(path[path.length - 1], path);
    this._makeItem(path, label, checkbox);
  }

  /**
   * make a text input field for string options.
   *
   * @param {number} defaultValue
   * @param {number} value
   * @param {Array} path    | where to look for the actual option
   * @private
   */
  _makeTextInput(defaultValue, value, path) {
    const checkbox = document.createElement("input");
    checkbox.type = "text";
    checkbox.className = "vis-configuration vis-config-text";
    checkbox.value = value;
    if (value !== defaultValue) {
      this.changedOptions.push({ path: path, value: value });
    }

    const me = this;
    checkbox.onchange = function () {
      me._update(this.value, path);
    };

    const label = this._makeLabel(path[path.length - 1], path);
    this._makeItem(path, label, checkbox);
  }

  /**
   * make a color field with a color picker for color fields
   *
   * @param {Array.<number>} arr
   * @param {number} value
   * @param {Array} path    | where to look for the actual option
   * @private
   */
  _makeColorField(arr, value, path) {
    const defaultColor = arr[1];
    const div = document.createElement("div");
    value = value === undefined ? defaultColor : value;

    if (value !== "none") {
      div.className = "vis-configuration vis-config-colorBlock";
      div.style.backgroundColor = value;
    } else {
      div.className = "vis-configuration vis-config-colorBlock none";
    }

    value = value === undefined ? defaultColor : value;
    div.onclick = () => {
      this._showColorPicker(value, div, path);
    };

    const label = this._makeLabel(path[path.length - 1], path);
    this._makeItem(path, label, div);
  }

  /**
   * used by the color buttons to call the color picker.
   *
   * @param {number} value
   * @param {HTMLElement} div
   * @param {Array} path    | where to look for the actual option
   * @private
   */
  _showColorPicker(value, div, path) {
    // clear the callback from this div
    div.onclick = function () {};

    this.colorPicker.insertTo(div);
    this.colorPicker.show();

    this.colorPicker.setColor(value);
    this.colorPicker.setUpdateCallback((color) => {
      const colorString =
        "rgba(" + color.r + "," + color.g + "," + color.b + "," + color.a + ")";
      div.style.backgroundColor = colorString;
      this._update(colorString, path);
    });

    // on close of the colorpicker, restore the callback.
    this.colorPicker.setCloseCallback(() => {
      div.onclick = () => {
        this._showColorPicker(value, div, path);
      };
    });
  }

  /**
   * parse an object and draw the correct items
   *
   * @param {object} obj
   * @param {Array} [path=[]]    | where to look for the actual option
   * @param {boolean} [checkOnly=false]
   * @returns {boolean}
   * @private
   */
  _handleObject(obj, path = [], checkOnly = false) {
    let show = false;
    const filter = this.options.filter;
    let visibleInSet = false;
    for (const subObj in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, subObj)) {
        show = true;
        const item = obj[subObj];
        const newPath = copyAndExtendArray(path, subObj);
        if (typeof filter === "function") {
          show = filter(subObj, path);

          // if needed we must go deeper into the object.
          if (show === false) {
            if (
              !Array.isArray(item) &&
              typeof item !== "string" &&
              typeof item !== "boolean" &&
              item instanceof Object
            ) {
              this.allowCreation = false;
              show = this._handleObject(item, newPath, true);
              this.allowCreation = checkOnly === false;
            }
          }
        }

        if (show !== false) {
          visibleInSet = true;
          const value = this._getValue(newPath);

          if (Array.isArray(item)) {
            this._handleArray(item, value, newPath);
          } else if (typeof item === "string") {
            this._makeTextInput(item, value, newPath);
          } else if (typeof item === "boolean") {
            this._makeCheckbox(item, value, newPath);
          } else if (item instanceof Object) {
            // collapse the physics options that are not enabled
            let draw = true;
            if (path.indexOf("physics") !== -1) {
              if (
                this.moduleOptions.physics.solver !== subObj &&
                subObj !== "wind"
              ) {
                draw = false;
              }
            }

            if (draw === true) {
              // initially collapse options with an disabled enabled option.
              if (item.enabled !== undefined) {
                const enabledPath = copyAndExtendArray(newPath, "enabled");
                const enabledValue = this._getValue(enabledPath);
                if (enabledValue === true) {
                  const label = this._makeLabel(subObj, newPath, true);
                  this._makeItem(newPath, label);
                  visibleInSet =
                    this._handleObject(item, newPath) || visibleInSet;
                } else {
                  this._makeCheckbox(item, enabledValue, newPath);
                }
              } else {
                const label = this._makeLabel(subObj, newPath, true);
                this._makeItem(newPath, label);
                visibleInSet =
                  this._handleObject(item, newPath) || visibleInSet;
              }
            }
          } else {
            console.error("dont know how to handle", item, subObj, newPath);
          }
        }
      }
    }
    return visibleInSet;
  }

  /**
   * handle the array type of option
   *
   * @param {Array.<number>} arr
   * @param {number} value
   * @param {Array} path    | where to look for the actual option
   * @private
   */
  _handleArray(arr, value, path) {
    if (typeof arr[0] === "string" && arr[0] === "color") {
      this._makeColorField(arr, value, path);
      if (arr[1] !== value) {
        this.changedOptions.push({ path: path, value: value });
      }
    } else if (typeof arr[0] === "string") {
      this._makeDropdown(arr, value, path);
      if (arr[0] !== value) {
        this.changedOptions.push({ path: path, value: value });
      }
    } else if (typeof arr[0] === "number") {
      this._makeRange(arr, value, path);
      if (arr[0] !== value) {
        this.changedOptions.push({ path: path, value: Number(value) });
      }
    }
  }

  /**
   * called to update the network with the new settings.
   *
   * @param {number} value
   * @param {Array} path    | where to look for the actual option
   * @private
   */
  _update(value, path) {
    const options = this._constructOptions(value, path);

    if (
      this.parent.body &&
      this.parent.body.emitter &&
      this.parent.body.emitter.emit
    ) {
      this.parent.body.emitter.emit("configChange", options);
    }
    this.initialized = true;
    this.parent.setOptions(options);
  }

  /**
   *
   * @param {string | boolean} value
   * @param {Array.<string>} path
   * @param {{}} optionsObj
   * @returns {{}}
   * @private
   */
  _constructOptions(value, path, optionsObj = {}) {
    let pointer = optionsObj;

    // when dropdown boxes can be string or boolean, we typecast it into correct types
    value = value === "true" ? true : value;
    value = value === "false" ? false : value;

    for (let i = 0; i < path.length; i++) {
      if (path[i] !== "global") {
        if (pointer[path[i]] === undefined) {
          pointer[path[i]] = {};
        }
        if (i !== path.length - 1) {
          pointer = pointer[path[i]];
        } else {
          pointer[path[i]] = value;
        }
      }
    }
    return optionsObj;
  }

  /**
   * @private
   */
  _printOptions() {
    const options = this.getOptions();

    while (this.optionsContainer.firstChild) {
      this.optionsContainer.removeChild(this.optionsContainer.firstChild);
    }
    this.optionsContainer.appendChild(
      wrapInTag("pre", "const options = " + JSON.stringify(options, null, 2))
    );
  }

  /**
   *
   * @returns {{}} options
   */
  getOptions() {
    const options = {};
    for (let i = 0; i < this.changedOptions.length; i++) {
      this._constructOptions(
        this.changedOptions[i].value,
        this.changedOptions[i].path,
        options
      );
    }
    return options;
  }
}
