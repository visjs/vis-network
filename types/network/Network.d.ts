// Type definitions for vis.js 8.3.2
// Project: https://github.com/almende/vis, http://visjs.org
// Definitions by: Michaël Bitard <https://github.com/MichaelBitard>
//                 MacLeod Broad <https://github.com/macleodbroad-wf>
//                 Adrian Caballero <https://github.com/adripanico>
//                 Severin <https://github.com/seveves>
//                 kaktus40 <https://github.com/kaktus40>
//                 Matthieu Maitre <https://github.com/mmaitre314>
//                 Adam Lewis <https://github.com/supercargo>
//                 Alex Soh <https://github.com/takato1314>
//                 Oleksii Kachura <https://github.com/alex-kachura>
//                 dcop <https://github.com/dcop>
//                 Avraham Essoudry <https://github.com/avrahamcool>
//                 Dmitriy Trifonov <https://github.com/divideby>
//                 Sam Welek <https://github.com/tiberiushunter>
//                 Slaven Tomac <https://github.com/slavede>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

import { DataInterface, DataSet, DataView } from 'vis-data';
export type DataInterfaceEdges = DataInterface<Edge, 'id'>
export type DataInterfaceNodes = DataInterface<Node, 'id'>
export type DataSetEdges = DataSet<Edge, 'id'>
export type DataSetNodes = DataSet<Node, 'id'>
export type DataViewEdges = DataView<Edge, 'id'>
export type DataViewNodes = DataView<Node, 'id'>

export type IdType = string | number;
export type DirectionType = 'from' | 'to';

/**
 * If true (default) or an Object, the range is animated smoothly to the new window.
 * An object can be provided to specify duration and easing function.
 * Default duration is 500 ms, and default easing function is 'easeInOutQuad'.
 */
export type TimelineAnimationType = boolean | AnimationOptions;

export type NetworkEvents =
  'click' |
  'doubleClick' |
  'oncontext' |
  'hold' |
  'release' |
  'select' |
  'selectNode' |
  'selectEdge' |
  'deselectNode' |
  'deselectEdge' |
  'dragStart' |
  'dragging' |
  'dragEnd' |
  'controlNodeDragging' |
  'controlNodeDragEnd' |
  'hoverNode' |
  'blurNode' |
  'hoverEdge' |
  'blurEdge' |
  'zoom' |
  'showPopup' |
  'hidePopup' |
  'startStabilizing' |
  'stabilizationProgress' |
  'stabilizationIterationsDone' |
  'stabilized' |
  'resize' |
  'initRedraw' |
  'beforeDrawing' |
  'afterDrawing' |
  'animationFinished' |
  'configChange';

/**
 * Network is a visualization to display networks and networks consisting of nodes and edges.
 * The visualization is easy to use and supports custom shapes, styles, colors, sizes, images, and more.
 * The network visualization works smooth on any modern browser for up to a few thousand nodes and edges.
 * To handle a larger amount of nodes, Network has clustering support. Network uses HTML canvas for rendering.
 */
export class Network {
  /**
   * Creates an instance of Network.
   *
   * @param container the HTML element representing the network container
   * @param data network data
   * @param [options] optional network options
   */
  constructor(container: HTMLElement, data: Data, options?: Options);

  /**
   * 	Remove the network from the DOM and remove all Hammer bindings and references.
   */
  destroy(): void;

  /**
   * Override all the data in the network.
   * If stabilization is enabled in the physics module,
   * the network will stabilize again.
   * This method is also performed when first initializing the network.
   *
   * @param data network data
   */
  setData(data: Data): void;

  /**
   * Set the options.
   * All available options can be found in the modules above.
   * Each module requires it's own container with the module name to contain its options.
   *
   * @param options network options
   */
  setOptions(options: Options): void;

  /**
   * Set an event listener.
   * Depending on the type of event you get different parameters for the callback function.
   *
   * @param eventName the name of the event, f.e. 'click'
   * @param callback the callback function that will be raised
   */
  on(eventName: NetworkEvents, callback: (params?: any) => void): void;

  /**
   * Remove an event listener.
   * The function you supply has to be the exact same as the one you used in the on function.
   * If no function is supplied, all listeners will be removed.
   *
   * @param eventName the name of the event, f.e. 'click'
   * @param [callback] the exact same callback function that was used when calling 'on'
   */
  off(eventName: NetworkEvents, callback?: (params?: any) => void): void;

  /**
   * Set an event listener only once.
   * After it has taken place, the event listener will be removed.
   * Depending on the type of event you get different parameters for the callback function.
   *
   * @param eventName the name of the event, f.e. 'click'
   * @param callback the callback function that will be raised once
   */
  once(eventName: NetworkEvents, callback: (params?: any) => void): void;

  /**
   * This function converts canvas coordinates to coordinates on the DOM.
   * Input and output are in the form of {x:Number, y:Number} (IPosition interface).
   * The DOM values are relative to the network container.
   *
   * @param position the canvas coordinates
   * @returns the DOM coordinates
   */
  canvasToDOM(position: Position): Position;

  /**
   * This function converts DOM coordinates to coordinates on the canvas.
   * Input and output are in the form of {x:Number,y:Number} (IPosition interface).
   * The DOM values are relative to the network container.
   *
   * @param position the DOM coordinates
   * @returns the canvas coordinates
   */
  DOMtoCanvas(position: Position): Position;

  /**
   * Redraw the network.
   */
  redraw(): void;

  /**
   * Set the size of the canvas.
   * This is automatically done on a window resize.
   *
   * @param width width in a common format, f.e. '100px'
   * @param height height in a common format, f.e. '100px'
   */
  setSize(width: string, height: string): void;

  /**
   * The joinCondition function is presented with all nodes.
   */
  cluster(options?: ClusterOptions): void;

  /**
   * 	This method looks at the provided node and makes a cluster of it and all it's connected nodes.
   * The behaviour can be customized by proving the options object.
   * All options of this object are explained below.
   * The joinCondition is only presented with the connected nodes.
   *
   * @param nodeId the id of the node
   * @param [options] the cluster options
   */
  clusterByConnection(nodeId: string, options?: ClusterOptions): void;

  /**
   * This method checks all nodes in the network and those with a equal or higher
   * amount of edges than specified with the hubsize qualify.
   * If a hubsize is not defined, the hubsize will be determined as the average
   * value plus two standard deviations.
   * For all qualifying nodes, clusterByConnection is performed on each of them.
   * The options object is described for clusterByConnection and does the same here.
   *
   * @param [hubsize] optional hubsize
   * @param [options] optional cluster options
   */
  clusterByHubsize(hubsize?: number, options?: ClusterOptions): void;

  /**
   * This method will cluster all nodes with 1 edge with their respective connected node.
   *
   * @param [options] optional cluster options
   */
  clusterOutliers(options?: ClusterOptions): void;

  /**
   * Nodes can be in clusters.
   * Clusters can also be in clusters.
   * This function returns an array of nodeIds showing where the node is.
   *
   * Example:
   * cluster 'A' contains cluster 'B', cluster 'B' contains cluster 'C',
   * cluster 'C' contains node 'fred'.
   *
   * network.clustering.findNode('fred') will return ['A','B','C','fred'].
   *
   * @param nodeId the node id.
   * @returns an array of nodeIds showing where the node is
   */
  findNode(nodeId: IdType): IdType[];

  /**
   * Similar to findNode in that it returns all the edge ids that were
   * created from the provided edge during clustering.
   *
   * @param baseEdgeId the base edge id
   * @returns an array of edgeIds
   */
  getClusteredEdges(baseEdgeId: IdType): IdType[];

  /**
   * When a clusteredEdgeId is available, this method will return the original
   * baseEdgeId provided in data.edges ie.
   * After clustering the 'SelectEdge' event is fired but provides only the clustered edge.
   * This method can then be used to return the baseEdgeId.
   */
  getBaseEdge(clusteredEdgeId: IdType): IdType;

  /**
   * For the given clusteredEdgeId, this method will return all the original
   * base edge id's provided in data.edges.
   * For a non-clustered (i.e. 'base') edge, clusteredEdgeId is returned.
   * Only the base edge id's are returned.
   * All clustered edges id's under clusteredEdgeId are skipped,
   * but scanned recursively to return their base id's.
   */
  getBaseEdges(clusteredEdgeId: IdType): IdType[];

  /**
   * Visible edges between clustered nodes are not the same edge as the ones provided
   * in data.edges passed on network creation. With each layer of clustering, copies of
   * the edges between clusters are created and the previous edges are hidden,
   * until the cluster is opened. This method takes an edgeId (ie. a base edgeId from data.edges)
   * and applys the options to it and any edges that were created from it while clustering.
   */
  updateEdge(startEdgeId: IdType, options?: EdgeOptions): void;

  /**
   * Clustered Nodes when created are not contained in the original data.nodes
   * passed on network creation. This method updates the cluster node.
   */
  updateClusteredNode(clusteredNodeId: IdType, options?: NodeOptions): void;

  /**
   * Returns true if the node whose ID has been supplied is a cluster.
   *
   * @param nodeId the node id.
   */
  isCluster(nodeId: IdType): boolean;

  /**
   * Returns an array of all nodeIds of the nodes that
   * would be released if you open the cluster.
   *
   * @param clusterNodeId the id of the cluster node
   */
  getNodesInCluster(clusterNodeId: IdType): IdType[];

  /**
   * Opens the cluster, releases the contained nodes and edges,
   * removing the cluster node and cluster edges.
   * The options object is optional and currently supports one option,
   * releaseFunction, which is a function that can be used to manually
   * position the nodes after the cluster is opened.
   *
   * @param nodeId the node id
   * @param [options] optional open cluster options
   */
  openCluster(nodeId: IdType, options?: OpenClusterOptions): void;

  /**
   * If you like the layout of your network
   * and would like it to start in the same way next time,
   * ask for the seed using this method and put it in the layout.randomSeed option.
   *
   * @returns the current seed of the network.
   */
  getSeed(): number | string;

  /**
   * 	Programatically enable the edit mode.
   * Similar effect to pressing the edit button.
   */
  enableEditMode(): void;

  /**
   * Programatically disable the edit mode.
   * Similar effect to pressing the close icon (small cross in the corner of the toolbar).
   */
  disableEditMode(): void;

  /**
   * 	Go into addNode mode. Having edit mode or manipulation enabled is not required.
   * To get out of this mode, call disableEditMode().
   * The callback functions defined in handlerFunctions still apply.
   * To use these methods without having the manipulation GUI, make sure you set enabled to false.
   */
  addNodeMode(): void;

  /**
   * Edit the selected node.
   * The explaination from addNodeMode applies here as well.
   */
  editNode(): void;

  /**
   * Go into addEdge mode.
   * The explaination from addNodeMode applies here as well.
   */
  addEdgeMode(): void;

  /**
   * Go into editEdge mode.
   * The explaination from addNodeMode applies here as well.
   */
  editEdgeMode(): void;

  /**
   * Delete selected.
   * Having edit mode or manipulation enabled is not required.
   */
  deleteSelected(): void;

  /**
   * Returns the x y positions in canvas space of a requested node or array of nodes.
   * 
   * @remarks
   * - If `nodeIds` is supplied as a single id that does not correspond
   * to a node in the network, this function will return an empty object.
   * - If `nodeIds` is supplied as an array of ids, but one or more do not correspond to a node in the network, the
   * returned object will *not* include entries for the non-existent node positions.
   *
   * @param nodeIds - Either an array of node ids or a single node id. If not supplied, all node ids in the network will be used.
   * @returns A an object containing the x y positions in canvas space of the nodes in the network, keyed by id.
   */
  getPositions(nodeIds?: IdType[] | IdType): { [nodeId: string]: Position };

  /**
   * Retrieves the x y position of a specific id.
   * 
   * @param id - a node id
   * @returns the x y position in canvas space of the requested node.
   * 
   * @throws {@link TypeError} 
   *  Thrown if an undefined or null id is provided as a parameter.
   * @throws {@link ReferenceError} 
   *  Thrown if the id provided as a parameter does not correspond to a node in the network.
   */
  getPosition(nodeId: IdType): Position;

  /**
   * 	When using the vis.DataSet to load your nodes into the network,
   * this method will put the X and Y positions of all nodes into that dataset.
   * If you're loading your nodes from a database and have this dynamically coupled with the DataSet,
   * you can use this to stablize your network once, then save the positions in that database
   * through the DataSet so the next time you load the nodes, stabilization will be near instantaneous.
   *
   * If the nodes are still moving and you're using dynamic smooth edges (which is on by default),
   * you can use the option stabilization.onlyDynamicEdges in the physics module to improve initialization time.
   *
   * This method does not support clustering.
   * At the moment it is not possible to cache positions when using clusters since
   * they cannot be correctly initialized from just the positions.
   */
  storePositions(): void;

  /**
   * You can use this to programatically move a node.
   * The supplied x and y positions have to be in canvas space!
   *
   * @param nodeId the node that will be moved
   * @param x new canvas space x position
   * @param y new canvas space y position
   */
  moveNode(nodeId: IdType, x: number, y: number): void;

  /**
   * Returns a bounding box for the node including label.
   *
   */
  getBoundingBox(nodeId: IdType): BoundingBox;

  /**
   * Returns an array of nodeIds of the all the nodes that are directly connected to this node.
   * If you supply an edgeId, vis will first match the id to nodes.
   * If no match is found, it will search in the edgelist and return an array: [fromId, toId].
   *
   * @param nodeOrEdgeId a node or edge id
   */
  getConnectedNodes(nodeOrEdgeId: IdType, direction?: DirectionType): IdType[] | Array<{ fromId: IdType, toId: IdType }>;

  /**
   * Returns an array of edgeIds of the edges connected to this node.
   *
   * @param nodeId the node id
   */
  getConnectedEdges(nodeId: IdType): IdType[];

  /**
   * Start the physics simulation.
   * This is normally done whenever needed and is only really useful
   * if you stop the simulation yourself and wish to continue it afterwards.
   */
  startSimulation(): void;

  /**
   * This stops the physics simulation and triggers a stabilized event.
   * Tt can be restarted by dragging a node,
   * altering the dataset or calling startSimulation().
   */
  stopSimulation(): void;

  /**
   * You can manually call stabilize at any time.
   * All the stabilization options above are used.
   * You can optionally supply the number of iterations it should do.
   *
   * @param [iterations] the number of iterations it should do
   */
  stabilize(iterations?: number): void;

  /**
   * Returns an object with selected nodes and edges ids.
   *
   */
  getSelection(): { nodes: IdType[], edges: IdType[] };

  /**
   * Returns an array of selected node ids like so:
   * [nodeId1, nodeId2, ..].
   *
   */
  getSelectedNodes(): IdType[];

  /**
   * Returns an array of selected edge ids like so:
   * [edgeId1, edgeId2, ..].
   *
   */
  getSelectedEdges(): IdType[];

  /**
   * Returns a nodeId or undefined.
   * The DOM positions are expected to be in pixels from the top left corner of the canvas.
   *
   */
  getNodeAt(position: Position): IdType;

  /**
   * Returns a edgeId or undefined.
   * The DOM positions are expected to be in pixels from the top left corner of the canvas.
   *
   */
  getEdgeAt(position: Position): IdType;

  /**
   * Selects the nodes corresponding to the id's in the input array.
   * If highlightEdges is true or undefined, the neighbouring edges will also be selected.
   * This method unselects all other objects before selecting its own objects. Does not fire events.
   *
   */
  selectNodes(nodeIds: IdType[], highlightEdges?: boolean): void;

  /**
   * Selects the edges corresponding to the id's in the input array.
   * This method unselects all other objects before selecting its own objects.
   * Does not fire events.
   *
   */
  selectEdges(edgeIds: IdType[]): void;

  /**
   * Sets the selection.
   * You can also pass only nodes or edges in selection object.
   *
   */
  setSelection(selection: { nodes?: IdType[], edges?: IdType[] }, options?: SelectionOptions): void;

  /**
   * Unselect all objects.
   * Does not fire events.
   */
  unselectAll(): void;

  /**
   * Returns the current scale of the network.
   * 1.0 is comparible to 100%, 0 is zoomed out infinitely.
   *
   * @returns the current scale of the network
   */
  getScale(): number;

  /**
   * Returns the current central focus point of the view in the form: { x: {Number}, y: {Number} }
   *
   * @returns the view position;
   */
  getViewPosition(): Position;

  /**
   * Zooms out so all nodes fit on the canvas.
   *
   * @param [options] All options are optional for the fit method
   */
  fit(options?: FitOptions): void;

  /**
   * You can focus on a node with this function.
   * What that means is the view will lock onto that node, if it is moving, the view will also move accordingly.
   * If the view is dragged by the user, the focus is broken. You can supply options to customize the effect.
   *
   */
  focus(nodeId: IdType, options?: FocusOptions): void;

  /**
   * You can animate or move the camera using the moveTo method.
   *
   */
  moveTo(options: MoveToOptions): void;

  /**
   * Programatically release the focussed node.
   */
  releaseNode(): void;

  /**
   * If you use the configurator, you can call this method to get an options object that contains
   * all differences from the default options caused by users interacting with the configurator.
   *
   */
  getOptionsFromConfigurator(): any;
}

/**
 * Options interface for focus function.
 */
export interface FocusOptions extends ViewPortOptions {
  /**
   * Locked denotes whether or not the view remains locked to
   * the node once the zoom-in animation is finished.
   * Default value is true.
   */
  locked?: boolean;
}

/**
 * Base options interface for some viewport functions.
 */
export interface ViewPortOptions {
  /**
   * The scale is the target zoomlevel.
   * Default value is 1.0.
   */
  scale?: number;

  /**
   * The offset (in DOM units) is how many pixels from the center the view is focussed.
   * Default value is {x:0,y:0}
   */
  offset?: Position;

  /**
   * For animation you can either use a Boolean to use it with the default options or
   * disable it or you can define the duration (in milliseconds) and easing function manually.
   */
  animation?: AnimationOptions | boolean;
}

/**
 * You will have to define at least a scale, position or offset.
 * Otherwise, there is nothing to move to.
 */
export interface MoveToOptions extends ViewPortOptions {
  /**
   * The position (in canvas units!) is the position of the central focus point of the camera.
   */
  position?: Position;
}

/**
 * Animation options interface.
 */
export interface AnimationOptions {
  /**
   * The duration (in milliseconds).
   */
  duration: number;
  /**
   * The easing function.
   *
   * Available are:
   * linear, easeInQuad, easeOutQuad, easeInOutQuad, easeInCubic,
   * easeOutCubic, easeInOutCubic, easeInQuart, easeOutQuart, easeInOutQuart,
   * easeInQuint, easeOutQuint, easeInOutQuint.
   */
  easingFunction: EasingFunction;
}

export type EasingFunction =
  'linear' |
  'easeInQuad' |
  'easeOutQuad' |
  'easeInOutQuad' |
  'easeInCubic' |
  'easeOutCubic' |
  'easeInOutCubic' |
  'easeInQuart' |
  'easeOutQuart' |
  'easeInOutQuart' |
  'easeInQuint' |
  'easeOutQuint' |
  'easeInOutQuint';

/**
 * Optional options for the fit method.
 */
export interface FitOptions {
  /**
   * The nodes can be used to zoom to fit only specific nodes in the view.
   */
  nodes?: IdType[];

  /**
   * How far away can be zoomed out, the default is just above 0.
   *
   * @remarks
   * Values less than 1 mean zooming out, more than 1 means zooming in.
   */
  minZoomLevel?: number;

  /**
   * How close can be zoomed in, the default is 1.
   *
   * @remarks
   * Values less than 1 mean zooming out, more than 1 means zooming in.
   */
  maxZoomLevel?: number;

  /**
   * For animation you can either use a Boolean to use it with the default options or
   * disable it or you can define the duration (in milliseconds) and easing function manually.
   */
  animation?: TimelineAnimationType;
}

export interface SelectionOptions {
  unselectAll?: boolean;
  highlightEdges?: boolean;
}

/**
 * These values are in canvas space.
 */
export interface BoundingBox {
  top: number;
  left: number;
  right: number;
  bottom: number;
}

/**
 * Cluster methods options interface.
 */
export interface ClusterOptions {
  /**
   * Optional for all but the cluster method.
   * The cluster module loops over all nodes that are selected to be in the cluster
   * and calls this function with their data as argument. If this function returns true,
   * this node will be added to the cluster. You have access to all options (including the default)
   * as well as any custom fields you may have added to the node to determine whether or not to include it in the cluster.
   */
  joinCondition?(nodeOptions: any): boolean;

  /**
   * Optional.
   * Before creating the new cluster node, this (optional) function will be called with the properties
   * supplied by you (clusterNodeProperties), all contained nodes and all contained edges.
   * You can use this to update the properties of the cluster based on which items it contains.
   * The function should return the properties to create the cluster node.
   */
  processProperties?(clusterOptions: any, childNodesOptions: any[], childEdgesOptions: any[]): any;

  /**
   * Optional.
   * This is an object containing the options for the cluster node.
   * All options described in the nodes module are allowed.
   * This allows you to style your cluster node any way you want.
   * This is also the style object that is provided in the processProperties function for fine tuning.
   * If undefined, default node options will be used.
   */
  clusterNodeProperties?: NodeOptions;

  /**
   * Optional.
   * This is an object containing the options for the edges connected to the cluster.
   * All options described in the edges module are allowed.
   * Using this, you can style the edges connecting to the cluster any way you want.
   * If none are provided, the options from the edges that are replaced are used.
   * If undefined, default edge options will be used.
   */
  clusterEdgeProperties?: EdgeOptions;
}

/**
 * Options for the openCluster function of Network.
 */
export interface OpenClusterOptions {
  /**
   * A function that can be used to manually position the nodes after the cluster is opened.
   * The containedNodesPositions contain the positions of the nodes in the cluster at the
   * moment they were clustered. This function is expected to return the newPositions,
   * which can be the containedNodesPositions (altered) or a new object.
   * This has to be an object with keys equal to the nodeIds that exist in the
   * containedNodesPositions and an {x:x,y:y} position object.
   *
   * For all nodeIds not listed in this returned object,
   * we will position them at the location of the cluster.
   * This is also the default behaviour when no releaseFunction is defined.
   */
  releaseFunction(
    clusterPosition: Position,
    containedNodesPositions: { [nodeId: string]: Position }): { [nodeId: string]: Position };
}

export interface Position {
  x: number;
  y: number;
}

export interface Data {
  nodes?: Node[] | DataInterfaceNodes;
  edges?: Edge[] | DataInterfaceEdges;
}

export interface Node extends NodeOptions {
  id?: IdType;
}

export interface Edge extends EdgeOptions {
  from?: IdType;
  to?: IdType;
  id?: IdType;
}

export interface Locales {
  [language: string]: LocaleMessages | undefined;
  en?: LocaleMessages;
  cn?: LocaleMessages;
  de?: LocaleMessages;
  es?: LocaleMessages;
  it?: LocaleMessages;
  nl?: LocaleMessages;
  'pt-br'?: LocaleMessages;
  ru?: LocaleMessages;
}

export interface LocaleMessages {
  edit: string;
  del: string;
  back: string;
  addNode: string;
  addEdge: string;
  editNode: string;
  editEdge: string;
  addDescription: string;
  edgeDescription: string;
  editEdgeDescription: string;
  createEdgeError: string;
  deleteClusterError: string;
  editClusterError: string;
}

export interface Options {
  autoResize?: boolean;

  width?: string;

  height?: string;

  locale?: string;

  locales?: Locales;

  clickToUse?: boolean;

  configure?: any; // https://visjs.github.io/vis-network/docs/network/configure.html

  edges?: EdgeOptions;

  nodes?: NodeOptions;

  groups?: any;

  layout?: any; // https://visjs.github.io/vis-network/docs/network/layout.html

  interaction?: any; // https://visjs.github.io/vis-network/docs/network/interaction.html?keywords=edges

  manipulation?: any; // https://visjs.github.io/vis-network/docs/network/manipulation.html

  physics?: any; // https://visjs.github.io/vis-network/docs/network/physics.html
}

export interface Image {
  unselected?: string;
  selected?: string;
}

export interface ImagePadding {
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
}

export interface Color {
  border?: string;

  background?: string;

  highlight?: string | {
    border?: string;
    background?: string;
  };

  hover?: string | {
    border?: string;
    background?: string;
  };
}

export interface ChosenLabelValues {
  color: string;
  face: string;
  mod: string;
  size: number;
  strokeColor: string;
  strokeWidth: number;
  vadjust: number;
}
export type NodeChosenLabelFunction = (
  values: ChosenLabelValues,
  id: IdType,
  selected: boolean,
  hovered: boolean
) => void;

export interface ChosenNodeValues {
  borderColor: string;
  borderDashes: boolean | number[];
  borderRadius: number;
  borderWidth: number;
  color: string;
  shadow: boolean;
  shadowColor: string;
  shadowSize: number;
  shadowX: number;
  shadowY: number;
  size: number;
}
export type NodeChosenNodeFunction = (
  values: ChosenNodeValues,
  id: IdType,
  selected: boolean,
  hovered: boolean
) => void;

export interface NodeChosen {
  node: boolean | NodeChosenNodeFunction;
  label: boolean | NodeChosenLabelFunction;
}

export interface NodeOptions {
  borderWidth?: number;

  borderWidthSelected?: number;

  brokenImage?: string;

  color?: string | Color;

  chosen?: boolean | NodeChosen;

  opacity?: number;

  fixed?: boolean | {
    x?: boolean,
    y?: boolean,
  };

  font?: string | Font;

  group?: string;

  hidden?: boolean;

  icon?: {
    face?: string,
    code?: string,
    size?: number,  // 50,
    color?: string,
    weight?: number | string,
  };

  image?: string | Image;

  imagePadding?: number | ImagePadding;

  label?: string;

  labelHighlightBold?: boolean;

  level?: number;

  margin?: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  };

  mass?: number;

  physics?: boolean;

  scaling?: OptionsScaling;

  shadow?: boolean | OptionsShadow;

  shape?: string;

  shapeProperties?: {
    borderDashes?: boolean | number[], // only for borders
    borderRadius?: number,     // only for box shape
    interpolation?: boolean,  // only for image and circularImage shapes
    useImageSize?: boolean,  // only for image and circularImage shapes
    useBorderWithImage?: boolean,  // only for image shape
    coordinateOrigin?: string  // only for image and circularImage shapes
  };

  size?: number;

  title?: string;

  value?: number;

  /**
   * If false, no widthConstraint is applied. If a number is specified, the minimum and maximum widths of the node are set to the value.
   * The node's label's lines will be broken on spaces to stay below the maximum and the node's width
   * will be set to the minimum if less than the value.
   */
  widthConstraint?: number | boolean | { minimum?: number, maximum?: number };

  x?: number;

  y?: number;
}

export interface EdgeOptions {
  arrows?: string | {
    to?: boolean | ArrowHead
    middle?: boolean | ArrowHead
    from?: boolean | ArrowHead
  };

  arrowStrikethrough?: boolean;

  chosen?: boolean | {
    edge?: boolean, // please note, chosen.edge could be also a function. This case is not represented here
    label?: boolean, // please note, chosen.label could be also a function. This case is not represented here
  };

  color?: string | {
    color?: string,
    highlight?: string,
    hover?: string,
    inherit?: boolean | string,
    opacity?: number,
  };

  dashes?: boolean | number[];

  font?: string | Font;

  hidden?: boolean;

  hoverWidth?: number; // please note, hoverWidth could be also a function. This case is not represented here

  label?: string;

  labelHighlightBold?: boolean;

  length?: number;

  physics?: boolean;

  scaling?: OptionsScaling;

  selectionWidth?: number; // please note, selectionWidth could be also a function. This case is not represented here

  selfReferenceSize?: number;

  selfReference?: {
    size?: number,
    angle?: number,
    renderBehindTheNode?: boolean
  };

  shadow?: boolean | OptionsShadow;

  smooth?: boolean | {
    enabled: boolean,
    type: string,
    forceDirection?: string | boolean,
    roundness: number,
  };

  title?: string;

  value?: number;

  width?: number;

  widthConstraint?: number | boolean | {
    maximum?: number;
  };
}

export interface ArrowHead {
  enabled?: boolean,
  imageHeight?: number,
  imageWidth?: number,
  scaleFactor?: number,
  src?: string,
  type?: string;
}

export interface Font {
  color?: string,
  size?: number, // px
  face?: string,
  background?: string,
  strokeWidth?: number, // px
  strokeColor?: string,
  align?: string,
  vadjust?: number,
  multi?: boolean | string,
  bold?: string | FontStyles,
  ital?: string | FontStyles,
  boldital?: string | FontStyles,
  mono?: string | FontStyles,
}

export interface FontStyles {
  color?: string;
  size?: number;
  face?: string;
  mod?: string;
  vadjust?: number;
}

export interface OptionsScaling {
  min?: number;
  max?: number;
  label?: boolean | {
    enabled?: boolean,
    min?: number,
    max?: number,
    maxVisible?: number,
    drawThreshold?: number
  };
  customScalingFunction?(min?: number, max?: number, total?: number, value?: number): number;
}

export interface OptionsShadow {
  enabled?: boolean;
  color?: string;
  size?: number;
  x?: number;
  y?: number;
}
