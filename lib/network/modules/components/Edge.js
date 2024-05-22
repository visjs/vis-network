import {
  bridgeObject,
  deepExtend,
  isString,
  mergeOptions,
  selectiveDeepExtend,
} from "vis-util/esnext";
import Label from "./shared/Label";
import {
  choosify,
  getSelfRefCoordinates,
  isValidLabel,
  pointInRect,
} from "./shared/ComponentUtil";
import {
  BezierEdgeDynamic,
  BezierEdgeStatic,
  CubicBezierEdge,
  StraightEdge,
} from "./edges";

/**
 * An edge connects two nodes and has a specific direction.
 */
class Edge {
  /**
   * @param {object} options        values specific to this edge, must contain at least 'from' and 'to'
   * @param {object} body           shared state from Network instance
   * @param {Network.Images} imagelist  A list with images. Only needed when the edge has image arrows.
   * @param {object} globalOptions  options from the EdgesHandler instance
   * @param {object} defaultOptions default options from the EdgeHandler instance. Value and reference are constant
   */
  constructor(options, body, imagelist, globalOptions, defaultOptions) {
    if (body === undefined) {
      throw new Error("No body provided");
    }

    // Since globalOptions is constant in values as well as reference,
    // Following needs to be done only once.

    this.options = bridgeObject(globalOptions);
    this.globalOptions = globalOptions;
    this.defaultOptions = defaultOptions;
    this.body = body;
    this.imagelist = imagelist;

    // initialize variables
    this.id = undefined;
    this.fromId = undefined;
    this.toId = undefined;
    this.selected = false;
    this.hover = false;
    this.labelDirty = true;

    this.baseWidth = this.options.width;
    this.baseFontSize = this.options.font.size;

    this.from = undefined; // a node
    this.to = undefined; // a node

    this.edgeType = undefined;

    this.connected = false;

    this.labelModule = new Label(
      this.body,
      this.options,
      true /* It's an edge label */
    );
    this.setOptions(options);
  }

  /**
   * Set or overwrite options for the edge
   *
   * @param {object} options  an object with options
   * @returns {undefined|boolean} undefined if no options, true if layout affecting data changed, false otherwise.
   */
  setOptions(options) {
    if (!options) {
      return;
    }

    // Following options if changed affect the layout.
    let affectsLayout =
      (typeof options.physics !== "undefined" &&
        this.options.physics !== options.physics) ||
      (typeof options.hidden !== "undefined" &&
        (this.options.hidden || false) !== (options.hidden || false)) ||
      (typeof options.from !== "undefined" &&
        this.options.from !== options.from) ||
      (typeof options.to !== "undefined" && this.options.to !== options.to);

    Edge.parseOptions(this.options, options, true, this.globalOptions);

    if (options.id !== undefined) {
      this.id = options.id;
    }
    if (options.from !== undefined) {
      this.fromId = options.from;
    }
    if (options.to !== undefined) {
      this.toId = options.to;
    }
    if (options.title !== undefined) {
      this.title = options.title;
    }
    if (options.value !== undefined) {
      options.value = parseFloat(options.value);
    }

    const pile = [options, this.options, this.defaultOptions];
    this.chooser = choosify("edge", pile);

    // update label Module
    this.updateLabelModule(options);

    // Update edge type, this if changed affects the layout.
    affectsLayout = this.updateEdgeType() || affectsLayout;

    // if anything has been updates, reset the selection width and the hover width
    this._setInteractionWidths();

    // A node is connected when it has a from and to node that both exist in the network.body.nodes.
    this.connect();

    return affectsLayout;
  }

  /**
   *
   * @param {object} parentOptions
   * @param {object} newOptions
   * @param {boolean} [allowDeletion=false]
   * @param {object} [globalOptions={}]
   * @param {boolean} [copyFromGlobals=false]
   */
  static parseOptions(
    parentOptions,
    newOptions,
    allowDeletion = false,
    globalOptions = {},
    copyFromGlobals = false
  ) {
    const fields = [
      "endPointOffset",
      "arrowStrikethrough",
      "id",
      "from",
      "hidden",
      "hoverWidth",
      "labelHighlightBold",
      "length",
      "line",
      "opacity",
      "physics",
      "scaling",
      "selectionWidth",
      "selfReferenceSize",
      "selfReference",
      "to",
      "title",
      "value",
      "width",
      "font",
      "chosen",
      "widthConstraint",
    ];

    // only deep extend the items in the field array. These do not have shorthand.
    selectiveDeepExtend(fields, parentOptions, newOptions, allowDeletion);

    // Only use endPointOffset values (from and to) if it's valid values
    if (
      newOptions.endPointOffset !== undefined &&
      newOptions.endPointOffset.from !== undefined
    ) {
      if (Number.isFinite(newOptions.endPointOffset.from)) {
        parentOptions.endPointOffset.from = newOptions.endPointOffset.from;
      } else {
        parentOptions.endPointOffset.from =
          globalOptions.endPointOffset.from !== undefined
            ? globalOptions.endPointOffset.from
            : 0;
        console.error("endPointOffset.from is not a valid number");
      }
    }

    if (
      newOptions.endPointOffset !== undefined &&
      newOptions.endPointOffset.to !== undefined
    ) {
      if (Number.isFinite(newOptions.endPointOffset.to)) {
        parentOptions.endPointOffset.to = newOptions.endPointOffset.to;
      } else {
        parentOptions.endPointOffset.to =
          globalOptions.endPointOffset.to !== undefined
            ? globalOptions.endPointOffset.to
            : 0;
        console.error("endPointOffset.to is not a valid number");
      }
    }

    // Only copy label if it's a legal value.
    if (isValidLabel(newOptions.label)) {
      parentOptions.label = newOptions.label;
    } else if (!isValidLabel(parentOptions.label)) {
      parentOptions.label = undefined;
    }

    mergeOptions(parentOptions, newOptions, "smooth", globalOptions);
    mergeOptions(parentOptions, newOptions, "shadow", globalOptions);
    mergeOptions(parentOptions, newOptions, "background", globalOptions);

    if (newOptions.dashes !== undefined && newOptions.dashes !== null) {
      parentOptions.dashes = newOptions.dashes;
    } else if (allowDeletion === true && newOptions.dashes === null) {
      parentOptions.dashes = Object.create(globalOptions.dashes); // this sets the pointer of the option back to the global option.
    }

    // set the scaling newOptions
    if (newOptions.scaling !== undefined && newOptions.scaling !== null) {
      if (newOptions.scaling.min !== undefined) {
        parentOptions.scaling.min = newOptions.scaling.min;
      }
      if (newOptions.scaling.max !== undefined) {
        parentOptions.scaling.max = newOptions.scaling.max;
      }
      mergeOptions(
        parentOptions.scaling,
        newOptions.scaling,
        "label",
        globalOptions.scaling
      );
    } else if (allowDeletion === true && newOptions.scaling === null) {
      parentOptions.scaling = Object.create(globalOptions.scaling); // this sets the pointer of the option back to the global option.
    }

    // handle multiple input cases for arrows
    if (newOptions.arrows !== undefined && newOptions.arrows !== null) {
      if (typeof newOptions.arrows === "string") {
        const arrows = newOptions.arrows.toLowerCase();
        parentOptions.arrows.to.enabled = arrows.indexOf("to") != -1;
        parentOptions.arrows.middle.enabled = arrows.indexOf("middle") != -1;
        parentOptions.arrows.from.enabled = arrows.indexOf("from") != -1;
      } else if (typeof newOptions.arrows === "object") {
        mergeOptions(
          parentOptions.arrows,
          newOptions.arrows,
          "to",
          globalOptions.arrows
        );
        mergeOptions(
          parentOptions.arrows,
          newOptions.arrows,
          "middle",
          globalOptions.arrows
        );
        mergeOptions(
          parentOptions.arrows,
          newOptions.arrows,
          "from",
          globalOptions.arrows
        );
      } else {
        throw new Error(
          "The arrow newOptions can only be an object or a string. Refer to the documentation. You used:" +
            JSON.stringify(newOptions.arrows)
        );
      }
    } else if (allowDeletion === true && newOptions.arrows === null) {
      parentOptions.arrows = Object.create(globalOptions.arrows); // this sets the pointer of the option back to the global option.
    }

    // handle multiple input cases for color
    if (newOptions.color !== undefined && newOptions.color !== null) {
      const fromColor = isString(newOptions.color)
        ? {
            color: newOptions.color,
            highlight: newOptions.color,
            hover: newOptions.color,
            inherit: false,
            opacity: 1,
          }
        : newOptions.color;
      const toColor = parentOptions.color;

      // If passed, fill in values from default options - required in the case of no prototype bridging
      if (copyFromGlobals) {
        deepExtend(toColor, globalOptions.color, false, allowDeletion);
      } else {
        // Clear local properties - need to do it like this in order to retain prototype bridges
        for (const i in toColor) {
          if (Object.prototype.hasOwnProperty.call(toColor, i)) {
            delete toColor[i];
          }
        }
      }

      if (isString(toColor)) {
        toColor.color = toColor;
        toColor.highlight = toColor;
        toColor.hover = toColor;
        toColor.inherit = false;
        if (fromColor.opacity === undefined) {
          toColor.opacity = 1.0; // set default
        }
      } else {
        let colorsDefined = false;
        if (fromColor.color !== undefined) {
          toColor.color = fromColor.color;
          colorsDefined = true;
        }
        if (fromColor.highlight !== undefined) {
          toColor.highlight = fromColor.highlight;
          colorsDefined = true;
        }
        if (fromColor.hover !== undefined) {
          toColor.hover = fromColor.hover;
          colorsDefined = true;
        }
        if (fromColor.inherit !== undefined) {
          toColor.inherit = fromColor.inherit;
        }
        if (fromColor.opacity !== undefined) {
          toColor.opacity = Math.min(1, Math.max(0, fromColor.opacity));
        }

        if (colorsDefined === true) {
          toColor.inherit = false;
        } else {
          if (toColor.inherit === undefined) {
            toColor.inherit = "from"; // Set default
          }
        }
      }
    } else if (allowDeletion === true && newOptions.color === null) {
      parentOptions.color = bridgeObject(globalOptions.color); // set the object back to the global options
    }

    if (allowDeletion === true && newOptions.font === null) {
      parentOptions.font = bridgeObject(globalOptions.font); // set the object back to the global options
    }

    if (Object.prototype.hasOwnProperty.call(newOptions, "selfReferenceSize")) {
      console.warn(
        "The selfReferenceSize property has been deprecated. Please use selfReference property instead. The selfReference can be set like thise selfReference:{size:30, angle:Math.PI / 4}"
      );
      parentOptions.selfReference.size = newOptions.selfReferenceSize;
    }
  }

  /**
   *
   * @returns {ArrowOptions}
   */
  getFormattingValues() {
    const toArrow =
      this.options.arrows.to === true ||
      this.options.arrows.to.enabled === true;
    const fromArrow =
      this.options.arrows.from === true ||
      this.options.arrows.from.enabled === true;
    const middleArrow =
      this.options.arrows.middle === true ||
      this.options.arrows.middle.enabled === true;
    const inheritsColor = this.options.color.inherit;
    const values = {
      toArrow: toArrow,
      toArrowScale: this.options.arrows.to.scaleFactor,
      toArrowType: this.options.arrows.to.type,
      toArrowSrc: this.options.arrows.to.src,
      toArrowImageWidth: this.options.arrows.to.imageWidth,
      toArrowImageHeight: this.options.arrows.to.imageHeight,
      middleArrow: middleArrow,
      middleArrowScale: this.options.arrows.middle.scaleFactor,
      middleArrowType: this.options.arrows.middle.type,
      middleArrowSrc: this.options.arrows.middle.src,
      middleArrowImageWidth: this.options.arrows.middle.imageWidth,
      middleArrowImageHeight: this.options.arrows.middle.imageHeight,
      fromArrow: fromArrow,
      fromArrowScale: this.options.arrows.from.scaleFactor,
      fromArrowType: this.options.arrows.from.type,
      fromArrowSrc: this.options.arrows.from.src,
      fromArrowImageWidth: this.options.arrows.from.imageWidth,
      fromArrowImageHeight: this.options.arrows.from.imageHeight,
      arrowStrikethrough: this.options.arrowStrikethrough,
      color: inheritsColor ? undefined : this.options.color.color,
      inheritsColor: inheritsColor,
      opacity: this.options.color.opacity,
      hidden: this.options.hidden,
      length: this.options.length,
      shadow: this.options.shadow.enabled,
      shadowColor: this.options.shadow.color,
      shadowSize: this.options.shadow.size,
      shadowX: this.options.shadow.x,
      shadowY: this.options.shadow.y,
      dashes: this.options.dashes,
      width: this.options.width,
      background: this.options.background.enabled,
      backgroundColor: this.options.background.color,
      backgroundSize: this.options.background.size,
      backgroundDashes: this.options.background.dashes,
    };
    if (this.selected || this.hover) {
      if (this.chooser === true) {
        if (this.selected) {
          const selectedWidth = this.options.selectionWidth;
          if (typeof selectedWidth === "function") {
            values.width = selectedWidth(values.width);
          } else if (typeof selectedWidth === "number") {
            values.width += selectedWidth;
          }
          values.width = Math.max(values.width, 0.3 / this.body.view.scale);
          values.color = this.options.color.highlight;
          values.shadow = this.options.shadow.enabled;
        } else if (this.hover) {
          const hoverWidth = this.options.hoverWidth;
          if (typeof hoverWidth === "function") {
            values.width = hoverWidth(values.width);
          } else if (typeof hoverWidth === "number") {
            values.width += hoverWidth;
          }
          values.width = Math.max(values.width, 0.3 / this.body.view.scale);
          values.color = this.options.color.hover;
          values.shadow = this.options.shadow.enabled;
        }
      } else if (typeof this.chooser === "function") {
        this.chooser(values, this.options.id, this.selected, this.hover);
        if (values.color !== undefined) {
          values.inheritsColor = false;
        }
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
      values.width = Math.max(values.width, 0.3 / this.body.view.scale);
    }
    return values;
  }

  /**
   * update the options in the label module
   *
   * @param {object} options
   */
  updateLabelModule(options) {
    const pile = [
      options,
      this.options,
      this.globalOptions, // Currently set global edge options
      this.defaultOptions,
    ];

    this.labelModule.update(this.options, pile);

    if (this.labelModule.baseSize !== undefined) {
      this.baseFontSize = this.labelModule.baseSize;
    }
  }

  /**
   * update the edge type, set the options
   *
   * @returns {boolean}
   */
  updateEdgeType() {
    const smooth = this.options.smooth;
    let dataChanged = false;
    let changeInType = true;
    if (this.edgeType !== undefined) {
      if (
        (this.edgeType instanceof BezierEdgeDynamic &&
          smooth.enabled === true &&
          smooth.type === "dynamic") ||
        (this.edgeType instanceof CubicBezierEdge &&
          smooth.enabled === true &&
          smooth.type === "cubicBezier") ||
        (this.edgeType instanceof BezierEdgeStatic &&
          smooth.enabled === true &&
          smooth.type !== "dynamic" &&
          smooth.type !== "cubicBezier") ||
        (this.edgeType instanceof StraightEdge && smooth.type.enabled === false)
      ) {
        changeInType = false;
      }
      if (changeInType === true) {
        dataChanged = this.cleanup();
      }
    }
    if (changeInType === true) {
      if (smooth.enabled === true) {
        if (smooth.type === "dynamic") {
          dataChanged = true;
          this.edgeType = new BezierEdgeDynamic(
            this.options,
            this.body,
            this.labelModule
          );
        } else if (smooth.type === "cubicBezier") {
          this.edgeType = new CubicBezierEdge(
            this.options,
            this.body,
            this.labelModule
          );
        } else {
          this.edgeType = new BezierEdgeStatic(
            this.options,
            this.body,
            this.labelModule
          );
        }
      } else {
        this.edgeType = new StraightEdge(
          this.options,
          this.body,
          this.labelModule
        );
      }
    } else {
      // if nothing changes, we just set the options.
      this.edgeType.setOptions(this.options);
    }
    return dataChanged;
  }

  /**
   * Connect an edge to its nodes
   */
  connect() {
    this.disconnect();

    this.from = this.body.nodes[this.fromId] || undefined;
    this.to = this.body.nodes[this.toId] || undefined;
    this.connected = this.from !== undefined && this.to !== undefined;

    if (this.connected === true) {
      this.from.attachEdge(this);
      this.to.attachEdge(this);
    } else {
      if (this.from) {
        this.from.detachEdge(this);
      }
      if (this.to) {
        this.to.detachEdge(this);
      }
    }

    this.edgeType.connect();
  }

  /**
   * Disconnect an edge from its nodes
   */
  disconnect() {
    if (this.from) {
      this.from.detachEdge(this);
      this.from = undefined;
    }
    if (this.to) {
      this.to.detachEdge(this);
      this.to = undefined;
    }

    this.connected = false;
  }

  /**
   * get the title of this edge.
   *
   * @returns {string} title    The title of the edge, or undefined when no title
   *                           has been set.
   */
  getTitle() {
    return this.title;
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
   * Retrieve the value of the edge. Can be undefined
   *
   * @returns {number} value
   */
  getValue() {
    return this.options.value;
  }

  /**
   * Adjust the value range of the edge. The edge will adjust it's width
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
      const widthDiff = this.options.scaling.max - this.options.scaling.min;
      if (this.options.scaling.label.enabled === true) {
        const fontDiff =
          this.options.scaling.label.max - this.options.scaling.label.min;
        this.options.font.size =
          this.options.scaling.label.min + scale * fontDiff;
      }
      this.options.width = this.options.scaling.min + scale * widthDiff;
    } else {
      this.options.width = this.baseWidth;
      this.options.font.size = this.baseFontSize;
    }

    this._setInteractionWidths();
    this.updateLabelModule();
  }

  /**
   *
   * @private
   */
  _setInteractionWidths() {
    if (typeof this.options.hoverWidth === "function") {
      this.edgeType.hoverWidth = this.options.hoverWidth(this.options.width);
    } else {
      this.edgeType.hoverWidth = this.options.hoverWidth + this.options.width;
    }
    if (typeof this.options.selectionWidth === "function") {
      this.edgeType.selectionWidth = this.options.selectionWidth(
        this.options.width
      );
    } else {
      this.edgeType.selectionWidth =
        this.options.selectionWidth + this.options.width;
    }
  }

  /**
   * Redraw a edge
   * Draw this edge in the given canvas
   * The 2d context of a HTML canvas can be retrieved by canvas.getContext("2d");
   *
   * @param {CanvasRenderingContext2D}   ctx
   */
  draw(ctx) {
    const values = this.getFormattingValues();
    if (values.hidden) {
      return;
    }

    // get the via node from the edge type
    const viaNode = this.edgeType.getViaNode();

    // draw line and label
    this.edgeType.drawLine(ctx, values, this.selected, this.hover, viaNode);
    this.drawLabel(ctx, viaNode);
  }

  /**
   * Redraw arrows
   * Draw this arrows in the given canvas
   * The 2d context of a HTML canvas can be retrieved by canvas.getContext("2d");
   *
   * @param {CanvasRenderingContext2D}   ctx
   */
  drawArrows(ctx) {
    const values = this.getFormattingValues();
    if (values.hidden) {
      return;
    }

    // get the via node from the edge type
    const viaNode = this.edgeType.getViaNode();
    const arrowData = {};

    // restore edge targets to defaults
    this.edgeType.fromPoint = this.edgeType.from;
    this.edgeType.toPoint = this.edgeType.to;

    // from and to arrows give a different end point for edges. we set them here
    if (values.fromArrow) {
      arrowData.from = this.edgeType.getArrowData(
        ctx,
        "from",
        viaNode,
        this.selected,
        this.hover,
        values
      );
      if (values.arrowStrikethrough === false)
        this.edgeType.fromPoint = arrowData.from.core;
      if (values.fromArrowSrc) {
        arrowData.from.image = this.imagelist.load(values.fromArrowSrc);
      }
      if (values.fromArrowImageWidth) {
        arrowData.from.imageWidth = values.fromArrowImageWidth;
      }
      if (values.fromArrowImageHeight) {
        arrowData.from.imageHeight = values.fromArrowImageHeight;
      }
    }
    if (values.toArrow) {
      arrowData.to = this.edgeType.getArrowData(
        ctx,
        "to",
        viaNode,
        this.selected,
        this.hover,
        values
      );
      if (values.arrowStrikethrough === false)
        this.edgeType.toPoint = arrowData.to.core;
      if (values.toArrowSrc) {
        arrowData.to.image = this.imagelist.load(values.toArrowSrc);
      }
      if (values.toArrowImageWidth) {
        arrowData.to.imageWidth = values.toArrowImageWidth;
      }
      if (values.toArrowImageHeight) {
        arrowData.to.imageHeight = values.toArrowImageHeight;
      }
    }

    // the middle arrow depends on the line, which can depend on the to and from arrows so we do this one lastly.
    if (values.middleArrow) {
      arrowData.middle = this.edgeType.getArrowData(
        ctx,
        "middle",
        viaNode,
        this.selected,
        this.hover,
        values
      );

      if (values.middleArrowSrc) {
        arrowData.middle.image = this.imagelist.load(values.middleArrowSrc);
      }
      if (values.middleArrowImageWidth) {
        arrowData.middle.imageWidth = values.middleArrowImageWidth;
      }
      if (values.middleArrowImageHeight) {
        arrowData.middle.imageHeight = values.middleArrowImageHeight;
      }
    }

    if (values.fromArrow) {
      this.edgeType.drawArrowHead(
        ctx,
        values,
        this.selected,
        this.hover,
        arrowData.from
      );
    }
    if (values.middleArrow) {
      this.edgeType.drawArrowHead(
        ctx,
        values,
        this.selected,
        this.hover,
        arrowData.middle
      );
    }
    if (values.toArrow) {
      this.edgeType.drawArrowHead(
        ctx,
        values,
        this.selected,
        this.hover,
        arrowData.to
      );
    }
  }

  /**
   *
   * @param {CanvasRenderingContext2D} ctx
   * @param {Node} viaNode
   */
  drawLabel(ctx, viaNode) {
    if (this.options.label !== undefined) {
      // set style
      const node1 = this.from;
      const node2 = this.to;

      if (this.labelModule.differentState(this.selected, this.hover)) {
        this.labelModule.getTextSize(ctx, this.selected, this.hover);
      }

      let point;
      if (node1.id != node2.id) {
        this.labelModule.pointToSelf = false;
        point = this.edgeType.getPoint(0.5, viaNode);
        ctx.save();

        const rotationPoint = this._getRotation(ctx);
        if (rotationPoint.angle != 0) {
          ctx.translate(rotationPoint.x, rotationPoint.y);
          ctx.rotate(rotationPoint.angle);
        }

        // draw the label
        this.labelModule.draw(ctx, point.x, point.y, this.selected, this.hover);

        /*
        // Useful debug code: draw a border around the label
        // This should **not** be enabled in production!
        var size = this.labelModule.getSize();; // ;; intentional so lint catches it
        ctx.strokeStyle = "#ff0000";
        ctx.strokeRect(size.left, size.top, size.width, size.height);
        // End  debug code
*/

        ctx.restore();
      } else {
        // Ignore the orientations.
        this.labelModule.pointToSelf = true;

        // get circle coordinates
        const coordinates = getSelfRefCoordinates(
          ctx,
          this.options.selfReference.angle,
          this.options.selfReference.size,
          node1
        );

        point = this._pointOnCircle(
          coordinates.x,
          coordinates.y,
          this.options.selfReference.size,
          this.options.selfReference.angle
        );

        this.labelModule.draw(ctx, point.x, point.y, this.selected, this.hover);
      }
    }
  }

  /**
   * Determine all visual elements of this edge instance, in which the given
   * point falls within the bounding shape.
   *
   * @param {point} point
   * @returns {Array.<edgeClickItem|edgeLabelClickItem>} list with the items which are on the point
   */
  getItemsOnPoint(point) {
    const ret = [];

    if (this.labelModule.visible()) {
      const rotationPoint = this._getRotation();
      if (pointInRect(this.labelModule.getSize(), point, rotationPoint)) {
        ret.push({ edgeId: this.id, labelId: 0 });
      }
    }

    const obj = {
      left: point.x,
      top: point.y,
    };

    if (this.isOverlappingWith(obj)) {
      ret.push({ edgeId: this.id });
    }

    return ret;
  }

  /**
   * Check if this object is overlapping with the provided object
   *
   * @param {object} obj   an object with parameters left, top
   * @returns {boolean}     True if location is located on the edge
   */
  isOverlappingWith(obj) {
    if (this.connected) {
      const distMax = 10;
      const xFrom = this.from.x;
      const yFrom = this.from.y;
      const xTo = this.to.x;
      const yTo = this.to.y;
      const xObj = obj.left;
      const yObj = obj.top;

      const dist = this.edgeType.getDistanceToEdge(
        xFrom,
        yFrom,
        xTo,
        yTo,
        xObj,
        yObj
      );

      return dist < distMax;
    } else {
      return false;
    }
  }

  /**
   * Determine the rotation point, if any.
   *
   * @param {CanvasRenderingContext2D} [ctx] if passed, do a recalculation of the label size
   * @returns {rotationPoint} the point to rotate around and the angle in radians to rotate
   * @private
   */
  _getRotation(ctx) {
    const viaNode = this.edgeType.getViaNode();
    const point = this.edgeType.getPoint(0.5, viaNode);

    if (ctx !== undefined) {
      this.labelModule.calculateLabelSize(
        ctx,
        this.selected,
        this.hover,
        point.x,
        point.y
      );
    }

    const ret = {
      x: point.x,
      y: this.labelModule.size.yLine,
      angle: 0,
    };

    if (!this.labelModule.visible()) {
      return ret; // Don't even bother doing the atan2, there's nothing to draw
    }

    if (this.options.font.align === "horizontal") {
      return ret; // No need to calculate angle
    }

    const dy = this.from.y - this.to.y;
    const dx = this.from.x - this.to.x;
    let angle = Math.atan2(dy, dx); // radians

    // rotate so that label is readable
    if ((angle < -1 && dx < 0) || (angle > 0 && dx < 0)) {
      angle += Math.PI;
    }
    ret.angle = angle;

    return ret;
  }

  /**
   * Get a point on a circle
   *
   * @param {number} x
   * @param {number} y
   * @param {number} radius
   * @param {number} angle
   * @returns {object} point
   * @private
   */
  _pointOnCircle(x, y, radius, angle) {
    return {
      x: x + radius * Math.cos(angle),
      y: y - radius * Math.sin(angle),
    };
  }

  /**
   * Sets selected state to true
   */
  select() {
    this.selected = true;
  }

  /**
   * Sets selected state to false
   */
  unselect() {
    this.selected = false;
  }

  /**
   * cleans all required things on delete
   *
   * @returns {*}
   */
  cleanup() {
    return this.edgeType.cleanup();
  }

  /**
   * Remove edge from the list and perform necessary cleanup.
   */
  remove() {
    this.cleanup();
    this.disconnect();
    delete this.body.edges[this.id];
  }

  /**
   * Check if both connecting nodes exist
   *
   * @returns {boolean}
   */
  endPointsValid() {
    return (
      this.body.nodes[this.fromId] !== undefined &&
      this.body.nodes[this.toId] !== undefined
    );
  }
}

export default Edge;
