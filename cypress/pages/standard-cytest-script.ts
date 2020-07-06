// These imports are there only for their types. Their values can't be used as
// this will be loaded in a web browser without bundling.
import * as visNetworkStandalone from "../../standalone";
import * as visUtil from "vis-util";
import { Options } from "../../standalone";
import { UniversalConfig } from "../support/commands/types";
type VisNetworkStandalone = typeof visNetworkStandalone;
type VisUtil = typeof visUtil;

(async (): Promise<void> => {
  const $mynetwork = document.getElementById("mynetwork");
  if ($mynetwork == null) {
    throw new Error("Element #mynetwork was not found in the DOM.");
  }

  const $events = document.getElementById("events")!;
  if ($events == null) {
    throw new Error("Element #events was not found in the DOM.");
  }

  const $selection = document.getElementById("selection")!;
  if ($selection == null) {
    throw new Error("Element #selection was not found in the DOM.");
  }

  const $version = document.getElementById("version")!;
  if ($version == null) {
    throw new Error("Element #version was not found in the DOM.");
  }

  const $status = document.getElementById("status")!;
  if ($status == null) {
    throw new Error("Element #status was not found in the DOM.");
  }

  const config: UniversalConfig = JSON.parse(
    decodeURIComponent(location.hash.slice(1)) || "{}"
  );

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
        randomSeed: 77
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
                label: "Edit: " + ++editNumber
              });
            },
            editEdge: {
              editWithoutDrag: (
                edgeData: any,
                callback: (edgeData: any) => void
              ): void => {
                callback({
                  ...edgeData,
                  label: "Edit: " + ++editNumber
                });
              }
            }
          }
        : false,
      physics: config.physics ? true : false
    },
    // Raw options to override anything set above.
    config.options ?? {}
  );
  const network = new Network($mynetwork, data, options);

  const add = (
    root: HTMLElement,
    names: readonly (string | number)[],
    content: string | number
  ): void => {
    names = Array.isArray(names) ? names : [names];

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

  // Selection events:
  ([
    "deselectEdge",
    "deselectNode",
    "select",
    "selectEdge",
    "selectNode"
  ] as const).forEach((eventName): void => {
    network.on(eventName, (): void => {
      const selection = [
        ["node", network.getSelectedNodes()],
        ["edge", network.getSelectedEdges()]
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

  (window as any).visEdges = edges;
  (window as any).visLastEvents = {};
  (window as any).visNetwork = network;
  (window as any).visNodes = nodes;

  $status.innerText = "Ready";
})();
