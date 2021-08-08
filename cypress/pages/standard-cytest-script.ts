// These imports are there only for their types. Their values can't be used as
// this will be loaded in a web browser without bundling.
import type * as visNetworkStandalone from "../../standalone";
import type * as visUtil from "vis-util";
import type { Options } from "../../standalone";
import type { UniversalConfig, VisWindow } from "../support/commands/types";
type VisNetworkStandalone = typeof visNetworkStandalone;
type VisUtil = typeof visUtil;

(async (): Promise<void> => {
  // Wait for all the assets to load.
  await new Promise<void>((resolve): void => {
    if (document.readyState === "complete") {
      // Already loaded.
      resolve();
    } else {
      // Not loaded yet.
      window.addEventListener("load", (): void => void resolve());
    }
  });

  // Wait for the icon font to load (no TS support yet).
  await (document as any).fonts.load('24px "Material Design Icons"');

  const $mynetwork = document.getElementById("mynetwork");
  if ($mynetwork == null) {
    throw new Error("Element #mynetwork was not found in the DOM.");
  }

  const $events = document.getElementById("events");
  if ($events == null) {
    throw new Error("Element #events was not found in the DOM.");
  }

  const $selection = document.getElementById("selection");
  if ($selection == null) {
    throw new Error("Element #selection was not found in the DOM.");
  }

  const $selectionJSON = document.getElementById("selection-json");
  if ($selectionJSON == null) {
    throw new Error("Element #selection-json was not found in the DOM.");
  }

  const $version = document.getElementById("version");
  if ($version == null) {
    throw new Error("Element #version was not found in the DOM.");
  }

  const $status = document.getElementById("status");
  if ($status == null) {
    throw new Error("Element #status was not found in the DOM.");
  }

  const config: UniversalConfig = JSON.parse(
    decodeURIComponent(location.hash.slice(1)) || "{}"
  );
  console.info("config", config);

  // Turn stringified fuctions into actual executable function.
  for (const node of config?.nodes ?? []) {
    if (node?.ctxRenderer != null) {
      node.ctxRenderer = new Function(
        "payload",
        [
          '"use strict";',
          "",
          "return (" + node.ctxRenderer + ")(payload);",
        ].join("\n")
      );
    }
  }

  const baseURL =
    config.version == null
      ? "../.."
      : `https://unpkg.com/vis-network@${config.version}`;
  const standaloneURL = baseURL + "/standalone/umd/vis-network.min.js";

  $version.innerText = baseURL;

  // Load dependencies from Vis Util.
  const { deepObjectAssign } = await new Promise<VisUtil>((resolve): void => {
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src = "../../node_modules/vis-util/standalone/umd/vis-util.js";
    script.onload = (): void => {
      // Don't pollute the global scope.
      const vis = (window as any).vis;
      delete (window as any).vis;
      resolve(vis);
    };
    document.head.append(script);
  });

  // Load required version of Vis Network.
  const { DataSet, Network } = await new Promise<VisNetworkStandalone>(
    (resolve): void => {
      const script = document.createElement("script");
      script.type = "text/javascript";
      script.src = standaloneURL;
      script.onload = (): void => {
        // Keep this loaded for the tests to use as this would also be present
        // in production.
        resolve((window as any).vis);
      };
      document.head.append(script);
    }
  );

  let editNumber = 0;

  const nodes = new DataSet<any, "id">(config.nodes ?? []);
  const edges = new DataSet<any, "id">(config.edges ?? []);
  const data = { nodes, edges };
  const options = deepObjectAssign<Options>(
    {
      // Prevent random changes so that screenshots can be taken reliably.
      layout: {
        randomSeed: 77,
      },

      // Common configuration helpers.
      manipulation: config.manipulation
        ? {
            initiallyActive: true,
            editNode: (
              nodeData: any,
              callback: (nodeData: any) => void
            ): void => {
              callback({
                ...nodeData,
                label: "Edit: " + ++editNumber,
              });
            },
            editEdge: {
              editWithoutDrag: (
                edgeData: any,
                callback: (edgeData: any) => void
              ): void => {
                callback({
                  ...edgeData,
                  label: "Edit: " + ++editNumber,
                });
              },
            },
          }
        : false,
      physics: config.physics ? true : false,
    },
    // Raw options to override anything set above.
    config.options ?? {}
  );

  console.info("new Network", [$mynetwork, data, options]);
  const network = new Network($mynetwork, data, options);

  const add = (
    root: HTMLElement,
    names: readonly (string | number)[],
    content: string | number
  ): void => {
    const elem = document.createElement("pre");
    elem.classList.add(...names.map((value): string => "" + value));
    elem.innerText = "" + content;

    root.appendChild(elem);
  };

  // Interaction events:
  (["click"] as const).forEach((eventName): void => {
    network.on(eventName, (params: any): void => {
      (window as any).visLastEvents[eventName] = params;

      const oldElem = $events.querySelector(`#events > .${eventName}`);
      oldElem?.parentNode?.removeChild(oldElem);

      const el = document.createElement("div");
      el.classList.add(eventName);

      add(el, ["pointer", "DOM", "x"], params.pointer.DOM.x);
      add(el, ["pointer", "DOM", "y"], params.pointer.DOM.y);
      add(el, ["pointer", "canvas", "x"], params.pointer.canvas.x);
      add(el, ["pointer", "canvas", "y"], params.pointer.canvas.y);

      params.edges.forEach((edgeId: string | number): void => {
        add(el, ["edge", edgeId], edgeId);
      });
      params.nodes.forEach((nodeId: string | number): void => {
        add(el, ["node", nodeId], nodeId);
      });

      $events.appendChild(el);
    });
  });

  const updateSelectionJSON = (): void => {
    const selection = network.getSelection();
    $selectionJSON.innerText = JSON.stringify({
      nodes: [...selection.nodes].sort(),
      edges: [...selection.edges].sort(),
    });
  };
  // Make sure the selection is always filled in.
  updateSelectionJSON();

  // Selection events:
  (
    [
      "deselectEdge",
      "deselectNode",
      "select",
      "selectEdge",
      "selectNode",
    ] as const
  ).forEach((eventName): void => {
    network.on(eventName, updateSelectionJSON);

    network.on(eventName, (): void => {
      const selection = [
        ["node", network.getSelectedNodes()],
        ["edge", network.getSelectedEdges()],
      ] as const;

      // Empty the root element.
      while ($selection.firstChild) {
        $selection.firstChild.remove();
      }

      // Add current selection.
      for (const [type, ids] of selection) {
        for (const id of ids) {
          const el = document.createElement("pre");
          el.classList.add(type, "" + id);
          el.innerText = "" + id;
          $selection.appendChild(el);
        }
      }
    });
  });

  // Event queue:
  const eventQueue: VisWindow["visEventQueue"] = {} as any;
  (
    [
      "afterDrawing",
      "animationFinished",
      "beforeDrawing",
      "blurEdge",
      "blurNode",
      "click",
      "configChange",
      "controlNodeDragEnd",
      "controlNodeDragging",
      "deselectEdge",
      "deselectNode",
      "doubleClick",
      "dragEnd",
      "dragStart",
      "dragging",
      "hidePopup",
      "hold",
      "hoverEdge",
      "hoverNode",
      "initRedraw",
      "oncontext",
      "release",
      "resize",
      "select",
      "selectEdge",
      "selectNode",
      "showPopup",
      "stabilizationIterationsDone",
      "stabilizationProgress",
      "stabilized",
      "startStabilizing",
      "zoom",
    ] as const
  ).forEach((eventName): void => {
    eventQueue[eventName] = [];
    network.on(eventName, (params: any): void => {
      eventQueue[eventName].push({ params });
    });
  });

  Object.assign<any, VisWindow>(window, {
    visEdges: edges,
    visEventQueue: eventQueue,
    visLastEvents: {},
    visNetwork: network,
    visNodes: nodes,
  });

  $status.innerText = "Ready";
})();
