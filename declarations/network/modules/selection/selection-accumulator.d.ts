export interface Selectable {
    select(): void;
    unselect(): void;
}
interface SingleTypeSelectionAccumulatorChanges<T> {
    added: T[];
    deleted: T[];
    previous: T[];
    current: T[];
}
interface Node extends Selectable {
    $: "node";
}
interface Edge extends Selectable {
    $: "edge";
}
export interface SelectionAccumulatorCommitSummary {
    nodes: SingleTypeSelectionAccumulatorChanges<Node>;
    edges: SingleTypeSelectionAccumulatorChanges<Edge>;
}
export declare type SelectionAccumulatorCommitHandler<CommitArgs extends readonly any[]> = (summary: SelectionAccumulatorCommitSummary, ...rest: CommitArgs) => void;
export declare class SelectionAccumulator<CommitArgs extends readonly any[]> {
    #private;
    constructor(commitHandler?: SelectionAccumulatorCommitHandler<CommitArgs>);
    get sizeNodes(): number;
    get sizeEdges(): number;
    getNodes(): Node[];
    getEdges(): Edge[];
    addNodes(...nodes: readonly Node[]): void;
    addEdges(...edges: readonly Edge[]): void;
    deleteNodes(node: Node): void;
    deleteEdges(edge: Edge): void;
    clear(): void;
    commit(...rest: CommitArgs): SelectionAccumulatorCommitSummary;
}
export {};
//# sourceMappingURL=selection-accumulator.d.ts.map