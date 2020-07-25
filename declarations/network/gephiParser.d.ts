export declare type Id = number | string;
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
    attributes?: {
        title?: string;
    };
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
    attributes?: {
        title?: string;
    };
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
 *
 * @returns The converted data ready to be used in Vis.
 */
export declare function parseGephi(gephiJSON: GephiData, optionsObj?: GephiParseOptions): VisData;
//# sourceMappingURL=gephiParser.d.ts.map