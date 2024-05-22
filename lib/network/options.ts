import {
  ConfiguratorConfig,
  ConfiguratorHideOption,
  OptionsConfig,
} from "vis-util/esnext";

/**
 * This object contains all possible options. It will check if the types are correct, if required if the option is one
 * of the allowed values.
 *
 * __any__ means that the name of the property does not matter.
 * __type__ is a required field for all objects and contains the allowed types of all objects
 */
const string = "string";
const bool = "boolean";
const number = "number";
const array = "array";
const object = "object"; // should only be in a __type__ property
const dom = "dom";
const any = "any";

// List of endpoints
const endPoints = [
  "arrow",
  "bar",
  "box",
  "circle",
  "crow",
  "curve",
  "diamond",
  "image",
  "inv_curve",
  "inv_triangle",
  "triangle",
  "vee",
];

/* eslint-disable @typescript-eslint/naming-convention -- The __*__ format is used to prevent collisions with actual option names. */
const nodeOptions: OptionsConfig = {
  borderWidth: { number },
  borderWidthSelected: { number, undefined: "undefined" },
  brokenImage: { string, undefined: "undefined" },
  chosen: {
    label: { boolean: bool, function: "function" },
    node: { boolean: bool, function: "function" },
    __type__: { object, boolean: bool },
  },
  color: {
    border: { string },
    background: { string },
    highlight: {
      border: { string },
      background: { string },
      __type__: { object, string },
    },
    hover: {
      border: { string },
      background: { string },
      __type__: { object, string },
    },
    __type__: { object, string },
  },
  opacity: { number, undefined: "undefined" },
  fixed: {
    x: { boolean: bool },
    y: { boolean: bool },
    __type__: { object, boolean: bool },
  },
  font: {
    align: { string },
    color: { string },
    size: { number }, // px
    face: { string },
    background: { string },
    strokeWidth: { number }, // px
    strokeColor: { string },
    vadjust: { number },
    multi: { boolean: bool, string },
    bold: {
      color: { string },
      size: { number }, // px
      face: { string },
      mod: { string },
      vadjust: { number },
      __type__: { object, string },
    },
    boldital: {
      color: { string },
      size: { number }, // px
      face: { string },
      mod: { string },
      vadjust: { number },
      __type__: { object, string },
    },
    ital: {
      color: { string },
      size: { number }, // px
      face: { string },
      mod: { string },
      vadjust: { number },
      __type__: { object, string },
    },
    mono: {
      color: { string },
      size: { number }, // px
      face: { string },
      mod: { string },
      vadjust: { number },
      __type__: { object, string },
    },
    __type__: { object, string },
  },
  group: { string, number, undefined: "undefined" },
  heightConstraint: {
    minimum: { number },
    valign: { string },
    __type__: { object, boolean: bool, number },
  },
  hidden: { boolean: bool },
  icon: {
    face: { string },
    code: { string }, //'\uf007',
    size: { number }, //50,
    color: { string },
    weight: { string, number },
    __type__: { object },
  },
  id: { string, number },
  image: {
    selected: { string, undefined: "undefined" }, // --> URL
    unselected: { string, undefined: "undefined" }, // --> URL
    __type__: { object, string },
  },
  imagePadding: {
    top: { number },
    right: { number },
    bottom: { number },
    left: { number },
    __type__: { object, number },
  },
  label: { string, undefined: "undefined" },
  labelHighlightBold: { boolean: bool },
  level: { number, undefined: "undefined" },
  margin: {
    top: { number },
    right: { number },
    bottom: { number },
    left: { number },
    __type__: { object, number },
  },
  mass: { number },
  physics: { boolean: bool },
  scaling: {
    min: { number },
    max: { number },
    label: {
      enabled: { boolean: bool },
      min: { number },
      max: { number },
      maxVisible: { number },
      drawThreshold: { number },
      __type__: { object, boolean: bool },
    },
    customScalingFunction: { function: "function" },
    __type__: { object },
  },
  shadow: {
    enabled: { boolean: bool },
    color: { string },
    size: { number },
    x: { number },
    y: { number },
    __type__: { object, boolean: bool },
  },
  shape: {
    string: [
      "custom",
      "ellipse",
      "circle",
      "database",
      "box",
      "text",
      "image",
      "circularImage",
      "diamond",
      "dot",
      "star",
      "triangle",
      "triangleDown",
      "square",
      "icon",
      "hexagon",
    ],
  },
  ctxRenderer: { function: "function" },
  shapeProperties: {
    borderDashes: { boolean: bool, array },
    borderRadius: { number },
    interpolation: { boolean: bool },
    useImageSize: { boolean: bool },
    useBorderWithImage: { boolean: bool },
    coordinateOrigin: { string: ["center", "top-left"] },
    __type__: { object },
  },
  size: { number },
  title: { string, dom, undefined: "undefined" },
  value: { number, undefined: "undefined" },
  widthConstraint: {
    minimum: { number },
    maximum: { number },
    __type__: { object, boolean: bool, number },
  },
  x: { number },
  y: { number },
  __type__: { object },
};
const allOptions: OptionsConfig = {
  configure: {
    enabled: { boolean: bool },
    filter: { boolean: bool, string, array, function: "function" },
    container: { dom },
    showButton: { boolean: bool },
    __type__: { object, boolean: bool, string, array, function: "function" },
  },
  edges: {
    arrows: {
      to: {
        enabled: { boolean: bool },
        scaleFactor: { number },
        type: { string: endPoints },
        imageHeight: { number },
        imageWidth: { number },
        src: { string },
        __type__: { object, boolean: bool },
      },
      middle: {
        enabled: { boolean: bool },
        scaleFactor: { number },
        type: { string: endPoints },
        imageWidth: { number },
        imageHeight: { number },
        src: { string },
        __type__: { object, boolean: bool },
      },
      from: {
        enabled: { boolean: bool },
        scaleFactor: { number },
        type: { string: endPoints },
        imageWidth: { number },
        imageHeight: { number },
        src: { string },
        __type__: { object, boolean: bool },
      },
      __type__: { string: ["from", "to", "middle"], object },
    },
    endPointOffset: {
      from: {
        number: number,
      },
      to: {
        number: number,
      },
      __type__: {
        object: object,
        number: number,
      },
    },
    arrowStrikethrough: { boolean: bool },
    background: {
      enabled: { boolean: bool },
      color: { string },
      size: { number },
      dashes: { boolean: bool, array },
      __type__: { object, boolean: bool },
    },
    chosen: {
      label: { boolean: bool, function: "function" },
      edge: { boolean: bool, function: "function" },
      __type__: { object, boolean: bool },
    },
    color: {
      color: { string },
      highlight: { string },
      hover: { string },
      inherit: { string: ["from", "to", "both"], boolean: bool },
      opacity: { number },
      __type__: { object, string },
    },
    dashes: { boolean: bool, array },
    font: {
      color: { string },
      size: { number }, // px
      face: { string },
      background: { string },
      strokeWidth: { number }, // px
      strokeColor: { string },
      align: { string: ["horizontal", "top", "middle", "bottom"] },
      vadjust: { number },
      multi: { boolean: bool, string },
      bold: {
        color: { string },
        size: { number }, // px
        face: { string },
        mod: { string },
        vadjust: { number },
        __type__: { object, string },
      },
      boldital: {
        color: { string },
        size: { number }, // px
        face: { string },
        mod: { string },
        vadjust: { number },
        __type__: { object, string },
      },
      ital: {
        color: { string },
        size: { number }, // px
        face: { string },
        mod: { string },
        vadjust: { number },
        __type__: { object, string },
      },
      mono: {
        color: { string },
        size: { number }, // px
        face: { string },
        mod: { string },
        vadjust: { number },
        __type__: { object, string },
      },
      __type__: { object, string },
    },
    hidden: { boolean: bool },
    hoverWidth: { function: "function", number },
    label: { string, undefined: "undefined" },
    labelHighlightBold: { boolean: bool },
    length: { number, undefined: "undefined" },
    physics: { boolean: bool },
    scaling: {
      min: { number },
      max: { number },
      label: {
        enabled: { boolean: bool },
        min: { number },
        max: { number },
        maxVisible: { number },
        drawThreshold: { number },
        __type__: { object, boolean: bool },
      },
      customScalingFunction: { function: "function" },
      __type__: { object },
    },
    selectionWidth: { function: "function", number },
    selfReferenceSize: { number },
    selfReference: {
      size: { number },
      angle: { number },
      renderBehindTheNode: { boolean: bool },
      __type__: { object },
    },
    shadow: {
      enabled: { boolean: bool },
      color: { string },
      size: { number },
      x: { number },
      y: { number },
      __type__: { object, boolean: bool },
    },
    smooth: {
      enabled: { boolean: bool },
      type: {
        string: [
          "dynamic",
          "continuous",
          "discrete",
          "diagonalCross",
          "straightCross",
          "horizontal",
          "vertical",
          "curvedCW",
          "curvedCCW",
          "cubicBezier",
        ],
      },
      roundness: { number },
      forceDirection: {
        string: ["horizontal", "vertical", "none"],
        boolean: bool,
      },
      __type__: { object, boolean: bool },
    },
    title: { string, undefined: "undefined" },
    width: { number },
    widthConstraint: {
      maximum: { number },
      __type__: { object, boolean: bool, number },
    },
    value: { number, undefined: "undefined" },
    __type__: { object },
  },
  groups: {
    useDefaultGroups: { boolean: bool },
    __any__: nodeOptions,
    __type__: { object },
  },
  interaction: {
    dragNodes: { boolean: bool },
    dragView: { boolean: bool },
    hideEdgesOnDrag: { boolean: bool },
    hideEdgesOnZoom: { boolean: bool },
    hideNodesOnDrag: { boolean: bool },
    hover: { boolean: bool },
    keyboard: {
      enabled: { boolean: bool },
      speed: {
        x: { number },
        y: { number },
        zoom: { number },
        __type__: { object },
      },
      bindToWindow: { boolean: bool },
      autoFocus: { boolean: bool },
      __type__: { object, boolean: bool },
    },
    multiselect: { boolean: bool },
    navigationButtons: { boolean: bool },
    selectable: { boolean: bool },
    selectConnectedEdges: { boolean: bool },
    hoverConnectedEdges: { boolean: bool },
    tooltipDelay: { number },
    zoomView: { boolean: bool },
    zoomSpeed: { number },
    __type__: { object },
  },
  layout: {
    randomSeed: { undefined: "undefined", number, string },
    improvedLayout: { boolean: bool },
    clusterThreshold: { number },
    hierarchical: {
      enabled: { boolean: bool },
      levelSeparation: { number },
      nodeSpacing: { number },
      treeSpacing: { number },
      blockShifting: { boolean: bool },
      edgeMinimization: { boolean: bool },
      parentCentralization: { boolean: bool },
      direction: { string: ["UD", "DU", "LR", "RL"] }, // UD, DU, LR, RL
      sortMethod: { string: ["hubsize", "directed"] }, // hubsize, directed
      shakeTowards: { string: ["leaves", "roots"] }, // leaves, roots
      __type__: { object, boolean: bool },
    },
    __type__: { object },
  },
  manipulation: {
    enabled: { boolean: bool },
    initiallyActive: { boolean: bool },
    addNode: { boolean: bool, function: "function" },
    addEdge: { boolean: bool, function: "function" },
    editNode: { function: "function" },
    editEdge: {
      editWithoutDrag: { function: "function" },
      __type__: { object, boolean: bool, function: "function" },
    },
    deleteNode: { boolean: bool, function: "function" },
    deleteEdge: { boolean: bool, function: "function" },
    controlNodeStyle: nodeOptions,
    __type__: { object, boolean: bool },
  },
  nodes: nodeOptions,
  physics: {
    enabled: { boolean: bool },
    barnesHut: {
      theta: { number },
      gravitationalConstant: { number },
      centralGravity: { number },
      springLength: { number },
      springConstant: { number },
      damping: { number },
      avoidOverlap: { number },
      __type__: { object },
    },
    forceAtlas2Based: {
      theta: { number },
      gravitationalConstant: { number },
      centralGravity: { number },
      springLength: { number },
      springConstant: { number },
      damping: { number },
      avoidOverlap: { number },
      __type__: { object },
    },
    repulsion: {
      centralGravity: { number },
      springLength: { number },
      springConstant: { number },
      nodeDistance: { number },
      damping: { number },
      __type__: { object },
    },
    hierarchicalRepulsion: {
      centralGravity: { number },
      springLength: { number },
      springConstant: { number },
      nodeDistance: { number },
      damping: { number },
      avoidOverlap: { number },
      __type__: { object },
    },
    maxVelocity: { number },
    minVelocity: { number }, // px/s
    solver: {
      string: [
        "barnesHut",
        "repulsion",
        "hierarchicalRepulsion",
        "forceAtlas2Based",
      ],
    },
    stabilization: {
      enabled: { boolean: bool },
      iterations: { number }, // maximum number of iteration to stabilize
      updateInterval: { number },
      onlyDynamicEdges: { boolean: bool },
      fit: { boolean: bool },
      __type__: { object, boolean: bool },
    },
    timestep: { number },
    adaptiveTimestep: { boolean: bool },
    wind: {
      x: { number },
      y: { number },
      __type__: { object },
    },
    __type__: { object, boolean: bool },
  },

  //globals :
  autoResize: { boolean: bool },
  clickToUse: { boolean: bool },
  locale: { string },
  locales: {
    __any__: { any },
    __type__: { object },
  },
  height: { string },
  width: { string },
  __type__: { object },
};
/* eslint-enable @typescript-eslint/naming-convention */

/**
 * This provides ranges, initial values, steps and dropdown menu choices for the
 * configuration.
 *
 * @remarks
 * Checkbox: `boolean`
 *   The value supllied will be used as the initial value.
 *
 * Text field: `string`
 *   The passed text will be used as the initial value. Any text will be
 *   accepted afterwards.
 *
 * Number range: `[number, number, number, number]`
 *   The meanings are `[initial value, min, max, step]`.
 *
 * Dropdown: `[Exclude<string, "color">, ...(string | number | boolean)[]]`
 *   Translations for people with poor understanding of TypeScript: the first
 *   value always has to be a string but never `"color"`, the rest can be any
 *   combination of strings, numbers and booleans.
 *
 * Color picker: `["color", string]`
 *   The first value says this will be a color picker not a dropdown menu. The
 *   next value is the initial color.
 */
const configureOptions: ConfiguratorConfig = {
  nodes: {
    borderWidth: [1, 0, 10, 1],
    borderWidthSelected: [2, 0, 10, 1],
    color: {
      border: ["color", "#2B7CE9"],
      background: ["color", "#97C2FC"],
      highlight: {
        border: ["color", "#2B7CE9"],
        background: ["color", "#D2E5FF"],
      },
      hover: {
        border: ["color", "#2B7CE9"],
        background: ["color", "#D2E5FF"],
      },
    },
    opacity: [0, 0, 1, 0.1],
    fixed: {
      x: false,
      y: false,
    },
    font: {
      color: ["color", "#343434"],
      size: [14, 0, 100, 1], // px
      face: ["arial", "verdana", "tahoma"],
      background: ["color", "none"],
      strokeWidth: [0, 0, 50, 1], // px
      strokeColor: ["color", "#ffffff"],
    },
    //group: 'string',
    hidden: false,
    labelHighlightBold: true,
    //icon: {
    //  face: 'string',  //'FontAwesome',
    //  code: 'string',  //'\uf007',
    //  size: [50, 0, 200, 1],  //50,
    //  color: ['color','#2B7CE9']   //'#aa00ff'
    //},
    //image: 'string', // --> URL
    physics: true,
    scaling: {
      min: [10, 0, 200, 1],
      max: [30, 0, 200, 1],
      label: {
        enabled: false,
        min: [14, 0, 200, 1],
        max: [30, 0, 200, 1],
        maxVisible: [30, 0, 200, 1],
        drawThreshold: [5, 0, 20, 1],
      },
    },
    shadow: {
      enabled: false,
      color: "rgba(0,0,0,0.5)",
      size: [10, 0, 20, 1],
      x: [5, -30, 30, 1],
      y: [5, -30, 30, 1],
    },
    shape: [
      "ellipse",
      "box",
      "circle",
      "database",
      "diamond",
      "dot",
      "square",
      "star",
      "text",
      "triangle",
      "triangleDown",
      "hexagon",
    ],
    shapeProperties: {
      borderDashes: false,
      borderRadius: [6, 0, 20, 1],
      interpolation: true,
      useImageSize: false,
    },
    size: [25, 0, 200, 1],
  },
  edges: {
    arrows: {
      to: { enabled: false, scaleFactor: [1, 0, 3, 0.05], type: "arrow" },
      middle: { enabled: false, scaleFactor: [1, 0, 3, 0.05], type: "arrow" },
      from: { enabled: false, scaleFactor: [1, 0, 3, 0.05], type: "arrow" },
    },
    endPointOffset: {
      from: [0, -10, 10, 1],
      to: [0, -10, 10, 1],
    },
    arrowStrikethrough: true,
    color: {
      color: ["color", "#848484"],
      highlight: ["color", "#848484"],
      hover: ["color", "#848484"],
      inherit: ["from", "to", "both", true, false],
      opacity: [1, 0, 1, 0.05],
    },
    dashes: false,
    font: {
      color: ["color", "#343434"],
      size: [14, 0, 100, 1], // px
      face: ["arial", "verdana", "tahoma"],
      background: ["color", "none"],
      strokeWidth: [2, 0, 50, 1], // px
      strokeColor: ["color", "#ffffff"],
      align: ["horizontal", "top", "middle", "bottom"],
    },
    hidden: false,
    hoverWidth: [1.5, 0, 5, 0.1],
    labelHighlightBold: true,
    physics: true,
    scaling: {
      min: [1, 0, 100, 1],
      max: [15, 0, 100, 1],
      label: {
        enabled: true,
        min: [14, 0, 200, 1],
        max: [30, 0, 200, 1],
        maxVisible: [30, 0, 200, 1],
        drawThreshold: [5, 0, 20, 1],
      },
    },
    selectionWidth: [1.5, 0, 5, 0.1],
    selfReferenceSize: [20, 0, 200, 1],
    selfReference: {
      size: [20, 0, 200, 1],
      angle: [Math.PI / 2, -6 * Math.PI, 6 * Math.PI, Math.PI / 8],
      renderBehindTheNode: true,
    },
    shadow: {
      enabled: false,
      color: "rgba(0,0,0,0.5)",
      size: [10, 0, 20, 1],
      x: [5, -30, 30, 1],
      y: [5, -30, 30, 1],
    },
    smooth: {
      enabled: true,
      type: [
        "dynamic",
        "continuous",
        "discrete",
        "diagonalCross",
        "straightCross",
        "horizontal",
        "vertical",
        "curvedCW",
        "curvedCCW",
        "cubicBezier",
      ],
      forceDirection: ["horizontal", "vertical", "none"],
      roundness: [0.5, 0, 1, 0.05],
    },
    width: [1, 0, 30, 1],
  },
  layout: {
    //randomSeed: [0, 0, 500, 1],
    //improvedLayout: true,
    hierarchical: {
      enabled: false,
      levelSeparation: [150, 20, 500, 5],
      nodeSpacing: [100, 20, 500, 5],
      treeSpacing: [200, 20, 500, 5],
      blockShifting: true,
      edgeMinimization: true,
      parentCentralization: true,
      direction: ["UD", "DU", "LR", "RL"], // UD, DU, LR, RL
      sortMethod: ["hubsize", "directed"], // hubsize, directed
      shakeTowards: ["leaves", "roots"], // leaves, roots
    },
  },
  interaction: {
    dragNodes: true,
    dragView: true,
    hideEdgesOnDrag: false,
    hideEdgesOnZoom: false,
    hideNodesOnDrag: false,
    hover: false,
    keyboard: {
      enabled: false,
      speed: {
        x: [10, 0, 40, 1],
        y: [10, 0, 40, 1],
        zoom: [0.02, 0, 0.1, 0.005],
      },
      bindToWindow: true,
      autoFocus: true,
    },
    multiselect: false,
    navigationButtons: false,
    selectable: true,
    selectConnectedEdges: true,
    hoverConnectedEdges: true,
    tooltipDelay: [300, 0, 1000, 25],
    zoomView: true,
    zoomSpeed: [1, 0.1, 2, 0.1],
  },
  manipulation: {
    enabled: false,
    initiallyActive: false,
  },
  physics: {
    enabled: true,
    barnesHut: {
      theta: [0.5, 0.1, 1, 0.05],
      gravitationalConstant: [-2000, -30000, 0, 50],
      centralGravity: [0.3, 0, 10, 0.05],
      springLength: [95, 0, 500, 5],
      springConstant: [0.04, 0, 1.2, 0.005],
      damping: [0.09, 0, 1, 0.01],
      avoidOverlap: [0, 0, 1, 0.01],
    },
    forceAtlas2Based: {
      theta: [0.5, 0.1, 1, 0.05],
      gravitationalConstant: [-50, -500, 0, 1],
      centralGravity: [0.01, 0, 1, 0.005],
      springLength: [95, 0, 500, 5],
      springConstant: [0.08, 0, 1.2, 0.005],
      damping: [0.4, 0, 1, 0.01],
      avoidOverlap: [0, 0, 1, 0.01],
    },
    repulsion: {
      centralGravity: [0.2, 0, 10, 0.05],
      springLength: [200, 0, 500, 5],
      springConstant: [0.05, 0, 1.2, 0.005],
      nodeDistance: [100, 0, 500, 5],
      damping: [0.09, 0, 1, 0.01],
    },
    hierarchicalRepulsion: {
      centralGravity: [0.2, 0, 10, 0.05],
      springLength: [100, 0, 500, 5],
      springConstant: [0.01, 0, 1.2, 0.005],
      nodeDistance: [120, 0, 500, 5],
      damping: [0.09, 0, 1, 0.01],
      avoidOverlap: [0, 0, 1, 0.01],
    },
    maxVelocity: [50, 0, 150, 1],
    minVelocity: [0.1, 0.01, 0.5, 0.01],
    solver: [
      "barnesHut",
      "forceAtlas2Based",
      "repulsion",
      "hierarchicalRepulsion",
    ],
    timestep: [0.5, 0.01, 1, 0.01],
    wind: {
      x: [0, -10, 10, 0.1],
      y: [0, -10, 10, 0.1],
    },
    //adaptiveTimestep: true
  },
} as const;

export const configuratorHideOption: ConfiguratorHideOption = (
  parentPath,
  optionName,
  options
): boolean => {
  if (
    parentPath.includes("physics") &&
    (configureOptions as any).physics.solver.includes(optionName) &&
    options.physics.solver !== optionName &&
    optionName !== "wind"
  ) {
    return true;
  }

  return false;
};

export { allOptions, configureOptions };
