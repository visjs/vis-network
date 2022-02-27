import {
  VALIDATOR_PRINT_STYLE,
  bridgeObject,
  fillIfDefined,
  mergeOptions,
  overrideOpacity,
  parseColor,
  selectiveNotDeepExtend,
} from "vis-util/esnext";

import Label from "./shared/Label";
import { choosify, pointInRect } from "./shared/ComponentUtil";
import Box from "./nodes/shapes/Box";
import Circle from "./nodes/shapes/Circle";
import CircularImage from "./nodes/shapes/CircularImage";
import CustomShape from "./nodes/shapes/CustomShape";
import Database from "./nodes/shapes/Database";
import Diamond from "./nodes/shapes/Diamond";
import Dot from "./nodes/shapes/Dot";
import Ellipse from "./nodes/shapes/Ellipse";
import Icon from "./nodes/shapes/Icon";
import Image from "./nodes/shapes/Image";
import Square from "./nodes/shapes/Square";
import Hexagon from "./nodes/shapes/Hexagon";
import Star from "./nodes/shapes/Star";
import Text from "./nodes/shapes/Text";
import Triangle from "./nodes/shapes/Triangle";
import TriangleDown from "./nodes/shapes/TriangleDown";

/**
 * A node. A node can be connected to other nodes via one or multiple edges.
 */
class Node {
  /**
   *
   * @param {object} options An object containing options for the node. All
   *                            options are optional, except for the id.
   *                              {number} id     Id of the node. Required
   *                              {string} label  Text label for the node
   *                              {number} x      Horizontal position of the node
   *                              {number} y      Vertical position of the node
   *                              {string} shape  Node shape
   *                              {string} image  An image url
   *                              {string} title  A title text, can be HTML
   *                              {anytype} group A group name or number
   * @param {object} body               Shared state of current network instance
   * @param {Network.Images} imagelist  A list with images. Only needed when the node has an image
   * @param {Groups} grouplist          A list with groups. Needed for retrieving group options
   * @param {object} globalOptions      Current global node options; these serve as defaults for the node instance
   * @param {object} defaultOptions     Global default options for nodes; note that this is also the prototype
   *                                    for parameter `globalOptions`.
   */
  constructor(
    options,
    body,
    imagelist,
    grouplist,
    globalOptions,
    defaultOptions
  ) {
    this.options = bridgeObject(globalOptions);
    this.globalOptions = globalOptions;
    this.defaultOptions = defaultOptions;
    this.body = body;

    this.edges = []; // all edges connected to this node

    // set defaults for the options
    this.id = undefined;
    this.imagelist = imagelist;
    this.grouplist = grouplist;

    // state options
    this.x = undefined;
    this.y = undefined;
    this.baseSize = this.options.size;
    this.baseFontSize = this.options.font.size;
    this.predefinedPosition = false; // used to check if initial fit should just take the range or approximate
    this.selected = false;
    this.hover = false;

    this.labelModule = new Label(
      this.body,
      this.options,
      false /* Not edge label */
    );
    this.setOptions(options);
  }

  /**
   * Attach a edge to the node
   *
   * @param {Edge} edge
   */
  attachEdge(edge) {
    if (this.edges.indexOf(edge) === -1) {
      this.edges.push(edge);
    }
  }

  /**
   * Detach a edge from the node
   *
   * @param {Edge} edge
   */
  detachEdge(edge) {
    const index = this.edges.indexOf(edge);
    if (index != -1) {
      this.edges.splice(index, 1);
    }
  }

  /**
   * Set or overwrite options for the node
   *
   * @param {object} options an object with options
   * @returns {null|boolean}
   */
  setOptions(options) {
    const currentShape = this.options.shape;

    if (!options) {
      return; // Note that the return value will be 'undefined'! This is OK.
    }

    // Save the color for later.
    // This is necessary in order to prevent local color from being overwritten by group color.
    // TODO: To prevent such workarounds the way options are handled should be rewritten from scratch.
    // This is not the only problem with current options handling.
    if (typeof options.color !== "undefined") {
      this._localColor = options.color;
    }

    // basic options
    if (options.id !== undefined) {
      this.id = options.id;
    }

    if (this.id === undefined) {
      throw new Error("Node must have an id");
    }

    Node.checkMass(options, this.id);

    // set these options locally
    // clear x and y positions
    if (options.x !== undefined) {
      if (options.x === null) {
        this.x = undefined;
        this.predefinedPosition = false;
      } else {
        this.x = parseInt(options.x);
        this.predefinedPosition = true;
      }
    }
    if (options.y !== undefined) {
      if (options.y === null) {
        this.y = undefined;
        this.predefinedPosition = false;
      } else {
        this.y = parseInt(options.y);
        this.predefinedPosition = true;
      }
    }
    if (options.size !== undefined) {
      this.baseSize = options.size;
    }
    if (options.value !== undefined) {
      options.value = parseFloat(options.value);
    }

    // this transforms all shorthands into fully defined options
    Node.parseOptions(
      this.options,
      options,
      true,
      this.globalOptions,
      this.grouplist
    );

    const pile = [options, this.options, this.defaultOptions];
    this.chooser = choosify("node", pile);

    this._load_images();
    this.updateLabelModule(options);

    // Need to set local opacity after `this.updateLabelModule(options);` because `this.updateLabelModule(options);` overrites local opacity with group opacity
    if (options.opacity !== undefined && Node.checkOpacity(options.opacity)) {
      this.options.opacity = options.opacity;
    }

    this.updateShape(currentShape);

    return options.hidden !== undefined || options.physics !== undefined;
  }

  /**
   * Load the images from the options, for the nodes that need them.
   *
   * Images are always loaded, even if they are not used in the current shape.
   * The user may switch to an image shape later on.
   *
   * @private
   */
  _load_images() {
    if (
      this.options.shape === "circularImage" ||
      this.options.shape === "image"
    ) {
      if (this.options.image === undefined) {
        throw new Error(
          "Option image must be defined for node type '" +
            this.options.shape +
            "'"
        );
      }
    }

    if (this.options.image === undefined) {
      return;
    }

    if (this.imagelist === undefined) {
      throw new Error("Internal Error: No images provided");
    }

    if (typeof this.options.image === "string") {
      this.imageObj = this.imagelist.load(
        this.options.image,
        this.options.brokenImage,
        this.id
      );
    } else {
      if (this.options.image.unselected === undefined) {
        throw new Error("No unselected image provided");
      }

      this.imageObj = this.imagelist.load(
        this.options.image.unselected,
        this.options.brokenImage,
        this.id
      );

      if (this.options.image.selected !== undefined) {
        this.imageObjAlt = this.imagelist.load(
          this.options.image.selected,
          this.options.brokenImage,
          this.id
        );
      } else {
        this.imageObjAlt = undefined;
      }
    }
  }

  /**
   * Check that opacity is only between 0 and 1
   *
   * @param {number} opacity
   * @returns {boolean}
   */
  static checkOpacity(opacity) {
    return 0 <= opacity && opacity <= 1;
  }

  /**
   * Check that origin is 'center' or 'top-left'
   *
   * @param {string} origin
   * @returns {boolean}
   */
  static checkCoordinateOrigin(origin) {
    return origin === undefined || origin === "center" || origin === "top-left";
  }

  /**
   * Copy group option values into the node options.
   *
   * The group options override the global node options, so the copy of group options
   *  must happen *after* the global node options have been set.
   *
   * This method must also be called also if the global node options have changed and the group options did not.
   *
   * @param {object} parentOptions
   * @param {object} newOptions  new values for the options, currently only passed in for check
   * @param {object} groupList
   */
  static updateGroupOptions(parentOptions, newOptions, groupList) {
    if (groupList === undefined) return; // No groups, nothing to do

    const group = parentOptions.group;

    // paranoia: the selected group is already merged into node options, check.
    if (
      newOptions !== undefined &&
      newOptions.group !== undefined &&
      group !== newOptions.group
    ) {
      throw new Error(
        "updateGroupOptions: group values in options don't match."
      );
    }

    const hasGroup =
      typeof group === "number" || (typeof group === "string" && group != "");
    if (!hasGroup) return; // current node has no group, no need to merge

    const groupObj = groupList.get(group);

    if (groupObj.opacity !== undefined && newOptions.opacity === undefined) {
      if (!Node.checkOpacity(groupObj.opacity)) {
        console.error(
          "Invalid option for node opacity. Value must be between 0 and 1, found: " +
            groupObj.opacity
        );
        groupObj.opacity = undefined;
      }
    }

    // Skip any new option to avoid them being overridden by the group options.
    const skipProperties = Object.getOwnPropertyNames(newOptions).filter(
      (p) => newOptions[p] != null
    );
    // Always skip merging group font options into parent; these are required to be distinct for labels
    skipProperties.push("font");
    selectiveNotDeepExtend(skipProperties, parentOptions, groupObj);

    // the color object needs to be completely defined.
    // Since groups can partially overwrite the colors, we parse it again, just in case.
    parentOptions.color = parseColor(parentOptions.color);
  }

  /**
   * This process all possible shorthands in the new options and makes sure that the parentOptions are fully defined.
   * Static so it can also be used by the handler.
   *
   * @param {object} parentOptions
   * @param {object} newOptions
   * @param {boolean} [allowDeletion=false]
   * @param {object} [globalOptions={}]
   * @param {object} [groupList]
   * @static
   */
  static parseOptions(
    parentOptions,
    newOptions,
    allowDeletion = false,
    globalOptions = {},
    groupList
  ) {
    const fields = ["color", "fixed", "shadow"];
    selectiveNotDeepExtend(fields, parentOptions, newOptions, allowDeletion);

    Node.checkMass(newOptions);

    if (parentOptions.opacity !== undefined) {
      if (!Node.checkOpacity(parentOptions.opacity)) {
        console.error(
          "Invalid option for node opacity. Value must be between 0 and 1, found: " +
            parentOptions.opacity
        );
        parentOptions.opacity = undefined;
      }
    }

    if (newOptions.opacity !== undefined) {
      if (!Node.checkOpacity(newOptions.opacity)) {
        console.error(
          "Invalid option for node opacity. Value must be between 0 and 1, found: " +
            newOptions.opacity
        );
        newOptions.opacity = undefined;
      }
    }

    if (
      newOptions.shapeProperties &&
      !Node.checkCoordinateOrigin(newOptions.shapeProperties.coordinateOrigin)
    ) {
      console.error(
        "Invalid option for node coordinateOrigin, found: " +
          newOptions.shapeProperties.coordinateOrigin
      );
    }

    // merge the shadow options into the parent.
    mergeOptions(parentOptions, newOptions, "shadow", globalOptions);

    // individual shape newOptions
    if (newOptions.color !== undefined && newOptions.color !== null) {
      const parsedColor = parseColor(newOptions.color);
      fillIfDefined(parentOptions.color, parsedColor);
    } else if (allowDeletion === true && newOptions.color === null) {
      parentOptions.color = bridgeObject(globalOptions.color); // set the object back to the global options
    }

    // handle the fixed options
    if (newOptions.fixed !== undefined && newOptions.fixed !== null) {
      if (typeof newOptions.fixed === "boolean") {
        parentOptions.fixed.x = newOptions.fixed;
        parentOptions.fixed.y = newOptions.fixed;
      } else {
        if (
          newOptions.fixed.x !== undefined &&
          typeof newOptions.fixed.x === "boolean"
        ) {
          parentOptions.fixed.x = newOptions.fixed.x;
        }
        if (
          newOptions.fixed.y !== undefined &&
          typeof newOptions.fixed.y === "boolean"
        ) {
          parentOptions.fixed.y = newOptions.fixed.y;
        }
      }
    }

    if (allowDeletion === true && newOptions.font === null) {
      parentOptions.font = bridgeObject(globalOptions.font); // set the object back to the global options
    }

    Node.updateGroupOptions(parentOptions, newOptions, groupList);

    // handle the scaling options, specifically the label part
    if (newOptions.scaling !== undefined) {
      mergeOptions(
        parentOptions.scaling,
        newOptions.scaling,
        "label",
        globalOptions.scaling
      );
    }
  }

  /**
   *
   * @returns {{color: *, borderWidth: *, borderColor: *, size: *, borderDashes: (boolean|Array|allOptions.nodes.shapeProperties.borderDashes|{boolean, array}), borderRadius: (number|allOptions.nodes.shapeProperties.borderRadius|{number}|Array), shadow: *, shadowColor: *, shadowSize: *, shadowX: *, shadowY: *}}
   */
  getFormattingValues() {
    const values = {
      color: this.options.color.background,
      opacity: this.options.opacity,
      borderWidth: this.options.borderWidth,
      borderColor: this.options.color.border,
      size: this.options.size,
      borderDashes: this.options.shapeProperties.borderDashes,
      borderRadius: this.options.shapeProperties.borderRadius,
      shadow: this.options.shadow.enabled,
      shadowColor: this.options.shadow.color,
      shadowSize: this.options.shadow.size,
      shadowX: this.options.shadow.x,
      shadowY: this.options.shadow.y,
    };
    if (this.selected || this.hover) {
      if (this.chooser === true) {
        if (this.selected) {
          if (this.options.borderWidthSelected != null) {
            values.borderWidth = this.options.borderWidthSelected;
          } else {
            values.borderWidth *= 2;
          }
          values.color = this.options.color.highlight.background;
          values.borderColor = this.options.color.highlight.border;
          values.shadow = this.options.shadow.enabled;
        } else if (this.hover) {
          values.color = this.options.color.hover.background;
          values.borderColor = this.options.color.hover.border;
          values.shadow = this.options.shadow.enabled;
        }
      } else if (typeof this.chooser === "function") {
        this.chooser(values, this.options.id, this.selected, this.hover);
        if (values.shadow === false) {
          if (
            values.shadowColor !== this.options.shadow.color ||
            values.shadowSize !== this.options.shadow.size ||
            values.shadowX !== this.options.shadow.x ||
            values.shadowY !== this.options.shadow.y
          ) {
            values.shadow = true;
          }
        }
      }
    } else {
      values.shadow = this.options.shadow.enabled;
    }
    if (this.options.opacity !== undefined) {
      const opacity = this.options.opacity;
      values.borderColor = overrideOpacity(values.borderColor, opacity);
      values.color = overrideOpacity(values.color, opacity);
      values.shadowColor = overrideOpacity(values.shadowColor, opacity);
    }
    return values;
  }

  /**
   *
   * @param {object} options
   */
  updateLabelModule(options) {
    if (this.options.label === undefined || this.options.label === null) {
      this.options.label = "";
    }

    Node.updateGroupOptions(
      this.options,
      {
        ...options,
        color: (options && options.color) || this._localColor || undefined,
      },
      this.grouplist
    );

    //
    // Note:The prototype chain for this.options is:
    //
    // this.options ->    NodesHandler.options    -> NodesHandler.defaultOptions
    //                 (also: this.globalOptions)
    //
    // Note that the prototypes are mentioned explicitly in the pile list below;
    // WE DON'T WANT THE ORDER OF THE PROTOTYPES!!!! At least, not for font handling of labels.
    // This is a good indication that the prototype usage of options is deficient.
    //
    const currentGroup = this.grouplist.get(this.options.group, false);
    const pile = [
      options, // new options
      this.options, // current node options, see comment above for prototype
      currentGroup, // group options, if any
      this.globalOptions, // Currently set global node options
      this.defaultOptions, // Default global node options
    ];
    this.labelModule.update(this.options, pile);

    if (this.labelModule.baseSize !== undefined) {
      this.baseFontSize = this.labelModule.baseSize;
    }
  }

  /**
   *
   * @param {string} currentShape
   */
  updateShape(currentShape) {
    if (currentShape === this.options.shape && this.shape) {
      this.shape.setOptions(this.options, this.imageObj, this.imageObjAlt);
    } else {
      // choose draw method depending on the shape
      switch (this.options.shape) {
        case "box":
          this.shape = new Box(this.options, this.body, this.labelModule);
          break;
        case "circle":
          this.shape = new Circle(this.options, this.body, this.labelModule);
          break;
        case "circularImage":
          this.shape = new CircularImage(
            this.options,
            this.body,
            this.labelModule,
            this.imageObj,
            this.imageObjAlt
          );
          break;
        case "custom":
          this.shape = new CustomShape(
            this.options,
            this.body,
            this.labelModule,
            this.options.ctxRenderer
          );
          break;
        case "database":
          this.shape = new Database(this.options, this.body, this.labelModule);
          break;
        case "diamond":
          this.shape = new Diamond(this.options, this.body, this.labelModule);
          break;
        case "dot":
          this.shape = new Dot(this.options, this.body, this.labelModule);
          break;
        case "ellipse":
          this.shape = new Ellipse(this.options, this.body, this.labelModule);
          break;
        case "icon":
          this.shape = new Icon(this.options, this.body, this.labelModule);
          break;
        case "image":
          this.shape = new Image(
            this.options,
            this.body,
            this.labelModule,
            this.imageObj,
            this.imageObjAlt
          );
          break;
        case "square":
          this.shape = new Square(this.options, this.body, this.labelModule);
          break;
        case "hexagon":
          this.shape = new Hexagon(this.options, this.body, this.labelModule);
          break;
        case "star":
          this.shape = new Star(this.options, this.body, this.labelModule);
          break;
        case "text":
          this.shape = new Text(this.options, this.body, this.labelModule);
          break;
        case "triangle":
          this.shape = new Triangle(this.options, this.body, this.labelModule);
          break;
        case "triangleDown":
          this.shape = new TriangleDown(
            this.options,
            this.body,
            this.labelModule
          );
          break;
        default:
          this.shape = new Ellipse(this.options, this.body, this.labelModule);
          break;
      }
    }
    this.needsRefresh();
  }

  /**
   * select this node
   */
  select() {
    this.selected = true;
    this.needsRefresh();
  }

  /**
   * unselect this node
   */
  unselect() {
    this.selected = false;
    this.needsRefresh();
  }

  /**
   * Reset the calculated size of the node, forces it to recalculate its size
   */
  needsRefresh() {
    this.shape.refreshNeeded = true;
  }

  /**
   * get the title of this node.
   *
   * @returns {string} title    The title of the node, or undefined when no title
   *                           has been set.
   */
  getTitle() {
    return this.options.title;
  }

  /**
   * Calculate the distance to the border of the Node
   *
   * @param {CanvasRenderingContext2D}   ctx
   * @param {number} angle        Angle in radians
   * @returns {number} distance   Distance to the border in pixels
   */
  distanceToBorder(ctx, angle) {
    return this.shape.distanceToBorder(ctx, angle);
  }

  /**
   * Check if this node has a fixed x and y position
   *
   * @returns {boolean}      true if fixed, false if not
   */
  isFixed() {
    return this.options.fixed.x && this.options.fixed.y;
  }

  /**
   * check if this node is selecte
   *
   * @returns {boolean} selected   True if node is selected, else false
   */
  isSelected() {
    return this.selected;
  }

  /**
   * Retrieve the value of the node. Can be undefined
   *
   * @returns {number} value
   */
  getValue() {
    return this.options.value;
  }

  /**
   * Get the current dimensions of the label
   *
   * @returns {rect}
   */
  getLabelSize() {
    return this.labelModule.size();
  }

  /**
   * Adjust the value range of the node. The node will adjust it's size
   * based on its value.
   *
   * @param {number} min
   * @param {number} max
   * @param {number} total
   */
  setValueRange(min, max, total) {
    if (this.options.value !== undefined) {
      const scale = this.options.scaling.customScalingFunction(
        min,
        max,
        total,
        this.options.value
      );
      const sizeDiff = this.options.scaling.max - this.options.scaling.min;
      if (this.options.scaling.label.enabled === true) {
        const fontDiff =
          this.options.scaling.label.max - this.options.scaling.label.min;
        this.options.font.size =
          this.options.scaling.label.min + scale * fontDiff;
      }
      this.options.size = this.options.scaling.min + scale * sizeDiff;
    } else {
      this.options.size = this.baseSize;
      this.options.font.size = this.baseFontSize;
    }

    this.updateLabelModule();
  }

  /**
   * Draw this node in the given canvas
   * The 2d context of a HTML canvas can be retrieved by canvas.getContext("2d");
   *
   * @param {CanvasRenderingContext2D}   ctx
   * @returns {object} Callbacks to draw later on higher layers.
   */
  draw(ctx) {
    const values = this.getFormattingValues();
    return (
      this.shape.draw(ctx, this.x, this.y, this.selected, this.hover, values) ||
      {}
    );
  }

  /**
   * Update the bounding box of the shape
   *
   * @param {CanvasRenderingContext2D}   ctx
   */
  updateBoundingBox(ctx) {
    this.shape.updateBoundingBox(this.x, this.y, ctx);
  }

  /**
   * Recalculate the size of this node in the given canvas
   * The 2d context of a HTML canvas can be retrieved by canvas.getContext("2d");
   *
   * @param {CanvasRenderingContext2D}   ctx
   */
  resize(ctx) {
    const values = this.getFormattingValues();
    this.shape.resize(ctx, this.selected, this.hover, values);
  }

  /**
   * Determine all visual elements of this node instance, in which the given
   * point falls within the bounding shape.
   *
   * @param {point} point
   * @returns {Array.<nodeClickItem|nodeLabelClickItem>} list with the items which are on the point
   */
  getItemsOnPoint(point) {
    const ret = [];

    if (this.labelModule.visible()) {
      if (pointInRect(this.labelModule.getSize(), point)) {
        ret.push({ nodeId: this.id, labelId: 0 });
      }
    }

    if (pointInRect(this.shape.boundingBox, point)) {
      ret.push({ nodeId: this.id });
    }

    return ret;
  }

  /**
   * Check if this object is overlapping with the provided object
   *
   * @param {object} obj   an object with parameters left, top, right, bottom
   * @returns {boolean}     True if location is located on node
   */
  isOverlappingWith(obj) {
    return (
      this.shape.left < obj.right &&
      this.shape.left + this.shape.width > obj.left &&
      this.shape.top < obj.bottom &&
      this.shape.top + this.shape.height > obj.top
    );
  }

  /**
   * Check if this object is overlapping with the provided object
   *
   * @param {object} obj   an object with parameters left, top, right, bottom
   * @returns {boolean}     True if location is located on node
   */
  isBoundingBoxOverlappingWith(obj) {
    return (
      this.shape.boundingBox.left < obj.right &&
      this.shape.boundingBox.right > obj.left &&
      this.shape.boundingBox.top < obj.bottom &&
      this.shape.boundingBox.bottom > obj.top
    );
  }

  /**
   * Check valid values for mass
   *
   * The mass may not be negative or zero. If it is, reset to 1
   *
   * @param {object} options
   * @param {Node.id} id
   * @static
   */
  static checkMass(options, id) {
    if (options.mass !== undefined && options.mass <= 0) {
      let strId = "";
      if (id !== undefined) {
        strId = " in node id: " + id;
      }
      console.error(
        "%cNegative or zero mass disallowed" + strId + ", setting mass to 1.",
        VALIDATOR_PRINT_STYLE
      );
      options.mass = 1;
    }
  }
}

export default Node;
