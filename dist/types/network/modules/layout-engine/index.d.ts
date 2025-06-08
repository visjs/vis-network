type Levels = Record<string | number, number>;
type Id = string | number;
interface Edge {
    connected: boolean;
    from: Node;
    fromId: Id;
    to: Node;
    toId: Id;
}
interface Node {
    id: Id;
    edges: Edge[];
}
/**
 * Assign levels to nodes according to their positions in the hierarchy. Leaves will be lined up at the bottom and all other nodes as close to their children as possible.
 * @param nodes - Visible nodes of the graph.
 * @returns Populated node levels.
 */
export declare function fillLevelsByDirectionLeaves(nodes: Map<Id, Node>): Levels;
/**
 * Assign levels to nodes according to their positions in the hierarchy. Roots will be lined up at the top and all nodes as close to their parents as possible.
 * @param nodes - Visible nodes of the graph.
 * @returns Populated node levels.
 */
export declare function fillLevelsByDirectionRoots(nodes: Map<Id, Node>): Levels;
export {};
//# sourceMappingURL=index.d.ts.map