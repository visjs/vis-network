import * as Vis from "../../standalone";
import { Options } from "../../standalone";

const container = document.getElementById("mynetwork");
if (container == null) {
  throw new Error("Network container (#mynetwork) was not found in the DOM.");
}

const eventsRoot = document.getElementById("events")!;
if (eventsRoot == null) {
  throw new Error("#events was not found in the DOM.");
}

const selectionRoot = document.getElementById("selection")!;
if (selectionRoot == null) {
  throw new Error("selection was not found in the DOM.");
}

const { DataSet, Network } = (window as any).vis as typeof Vis;
const config: {
  edges?: any[];
  nodes?: any[];

  manipulation?: boolean;
  physics?: boolean;
} = JSON.parse(decodeURIComponent(location.hash.slice(1)) || "{}");

let editNumber = 0;

const nodes = new DataSet<any, "id">(config.nodes ?? []);
const edges = new DataSet<any, "id">(config.edges ?? []);
const data = { nodes, edges };
const options: Options = {
  manipulation: config.manipulation
    ? {
        initiallyActive: true,
        editNode: (nodeData: any, callback: (nodeData: any) => void): void => {
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
};
const network = new Network(container, data, options);

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

    const oldElem = eventsRoot.querySelector(`#events > .${eventName}`);
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

    eventsRoot.appendChild(el);
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
    while (selectionRoot.firstChild) {
      selectionRoot.firstChild.remove();
    }

    // Add current selection.
    for (const [type, ids] of selection) {
      for (const id of ids) {
        const el = document.createElement("pre");
        el.classList.add(type, "" + id);
        el.innerText = "" + id;
        selectionRoot.appendChild(el);
      }
    }
  });
});

(window as any).visEdges = edges;
(window as any).visLastEvents = {};
(window as any).visNetwork = network;
(window as any).visNodes = nodes;
