export type Id = number | string;

export interface ColorObject {
  background: string;
  border: string;
  highlight: {
    background: string;
    border: string;
  };
  hover: {
    background: string;
    border: string;
  };
}

export interface GephiData {
  nodes: GephiNode[];
  edges: GephiEdge[];
}
export interface GephiParseOptions {
  fixed?: boolean;
  inheritColor?: boolean;
  parseColor?: boolean;
}

export interface GephiNode {
  id: Id;

  attributes?: { title?: string };
  color?: string;
  label?: string;
  size?: number;
  title?: string;
  x?: number;
  y?: number;
}
export interface GephiEdge {
  id: Id;
  source: Id;
  target: Id;

  attributes?: { title?: string };
  color?: string;
  label?: string;
  type?: string;
}

export interface VisData {
  nodes: VisNode[];
  edges: VisEdge[];
}

export interface VisNode {
  id: Id;
  fixed: boolean;

  color?: string | ColorObject;
  label?: string;
  size?: number;
  title?: string;
  x?: number;
  y?: number;

  attributes?: unknown;
}
export interface VisEdge {
  id: Id;
  from: Id;
  to: Id;

  arrows?: "to";
  color?: string;
  label?: string;
  title?: string;

  attributes?: unknown;
}

/**
 * Convert Gephi to Vis.
 *
 * @param gephiJSON - The parsed JSON data in Gephi format.
 * @param optionsObj - Additional options.
 * @returns The converted data ready to be used in Vis.
 */
export function parseGephi(
  gephiJSON: GephiData,
  optionsObj?: GephiParseOptions
): VisData {
  const options = {
    edges: {
      inheritColor: false,
    },
    nodes: {
      fixed: false,
      parseColor: false,
    },
  };

  if (optionsObj != null) {
    if (optionsObj.fixed != null) {
      options.nodes.fixed = optionsObj.fixed;
    }
    if (optionsObj.parseColor != null) {
      options.nodes.parseColor = optionsObj.parseColor;
    }
    if (optionsObj.inheritColor != null) {
      options.edges.inheritColor = optionsObj.inheritColor;
    }
  }

  const gEdges = gephiJSON.edges;
  const vEdges = gEdges.map((gEdge): VisEdge => {
    const vEdge: VisEdge = {
      from: gEdge.source,
      id: gEdge.id,
      to: gEdge.target,
    };

    if (gEdge.attributes != null) {
      vEdge.attributes = gEdge.attributes;
    }
    if (gEdge.label != null) {
      vEdge.label = gEdge.label;
    }
    if (gEdge.attributes != null && gEdge.attributes.title != null) {
      vEdge.title = gEdge.attributes.title;
    }
    if (gEdge.type === "Directed") {
      vEdge.arrows = "to";
    }
    // edge['value'] = gEdge.attributes != null ? gEdge.attributes.Weight : undefined;
    // edge['width'] = edge['value'] != null ? undefined : edgegEdge.size;
    if (gEdge.color && options.edges.inheritColor === false) {
      vEdge.color = gEdge.color;
    }

    return vEdge;
  });

  const vNodes = gephiJSON.nodes.map((gNode): VisNode => {
    const vNode: VisNode = {
      id: gNode.id,
      fixed: options.nodes.fixed && gNode.x != null && gNode.y != null,
    };

    if (gNode.attributes != null) {
      vNode.attributes = gNode.attributes;
    }
    if (gNode.label != null) {
      vNode.label = gNode.label;
    }
    if (gNode.size != null) {
      vNode.size = gNode.size;
    }
    if (gNode.attributes != null && gNode.attributes.title != null) {
      vNode.title = gNode.attributes.title;
    }
    if (gNode.title != null) {
      vNode.title = gNode.title;
    }
    if (gNode.x != null) {
      vNode.x = gNode.x;
    }
    if (gNode.y != null) {
      vNode.y = gNode.y;
    }
    if (gNode.color != null) {
      if (options.nodes.parseColor === true) {
        vNode.color = gNode.color;
      } else {
        vNode.color = {
          background: gNode.color,
          border: gNode.color,
          highlight: {
            background: gNode.color,
            border: gNode.color,
          },
          hover: {
            background: gNode.color,
            border: gNode.color,
          },
        };
      }
    }

    return vNode;
  });

  return { nodes: vNodes, edges: vEdges };
}
