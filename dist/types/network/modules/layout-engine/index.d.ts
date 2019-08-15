declare type Levels = Record<string | number, number>;
interface Edge {
    from: Node;
    to: Node;
    connected: boolean;
}
interface Node {
    id: string | number;
    edges: Edge[];
}
/**
 * Detect whether a node is a part of a cycle.
 *
 * @param entryNode - Any node from the graph.
 *
 * @returns True if a cycle was found, false if no cycle was found.
 */
export declare function isInCycle(entryNode: Node): boolean;
/**
 * Detect cycle(s) in a graph.
 *
 * @TODO This is a very slow solution, optimize it!
 *
 * @param edges - Edges of the graph.
 *
 * @returns True if a cycle was found, false if no cycle was found.
 */
export declare function hasCycles(edges: Edge[]): boolean;
/**
 * Assign levels to nodes according to their positions in the hierarchy.
 *
 * @param edges - Edges of the graph.
 * @param levels - If present levels will be added to it, if not a new object will be created.
 *
 * @returns Populated node levels.
 */
export declare function fillLevelsByDirection(edges: Edge[], levels?: Levels): Levels;
export {};
//# sourceMappingURL=index.d.ts.map