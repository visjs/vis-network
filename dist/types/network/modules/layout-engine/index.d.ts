declare type Levels = Record<string | number, number>;
interface Edge {
    connected: boolean;
    from: Node;
    fromId: string | number;
    to: Node;
    toId: string | number;
}
interface Node {
    id: string | number;
    edges: Edge[];
}
/**
 * Assign levels to nodes according to their positions in the hierarchy.
 *
 * @param nodes - Nodes of the graph.
 * @param levels - If present levels will be added to it, if not a new object will be created.
 *
 * @returns Populated node levels.
 */
export declare function fillLevelsByDirection(nodes: Node[], levels?: Levels): Levels;
export {};
//# sourceMappingURL=index.d.ts.map