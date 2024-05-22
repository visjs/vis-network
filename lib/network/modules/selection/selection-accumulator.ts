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

/**
 * @param prev
 * @param next
 */
function diffSets<T>(prev: ReadonlySet<T>, next: ReadonlySet<T>): Set<T> {
  const diff = new Set<T>();
  for (const item of next) {
    if (!prev.has(item)) {
      diff.add(item);
    }
  }
  return diff;
}

class SingleTypeSelectionAccumulator<T extends Selectable> {
  #previousSelection: ReadonlySet<T> = new Set();
  #selection: Set<T> = new Set();

  public get size(): number {
    return this.#selection.size;
  }

  public add(...items: readonly T[]): void {
    for (const item of items) {
      this.#selection.add(item);
    }
  }
  public delete(...items: readonly T[]): void {
    for (const item of items) {
      this.#selection.delete(item);
    }
  }
  public clear(): void {
    this.#selection.clear();
  }

  public getSelection(): T[] {
    return [...this.#selection];
  }

  public getChanges(): SingleTypeSelectionAccumulatorChanges<T> {
    return {
      added: [...diffSets(this.#previousSelection, this.#selection)],
      deleted: [...diffSets(this.#selection, this.#previousSelection)],
      previous: [...new Set<T>(this.#previousSelection)],
      current: [...new Set<T>(this.#selection)],
    };
  }

  public commit(): SingleTypeSelectionAccumulatorChanges<T> {
    const changes = this.getChanges();

    this.#previousSelection = this.#selection;
    this.#selection = new Set(this.#previousSelection);

    for (const item of changes.added) {
      item.select();
    }
    for (const item of changes.deleted) {
      item.unselect();
    }

    return changes;
  }
}

// TODO: These should be real types imported from node.ts and edge.ts that don't
// exist yet.
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

export type SelectionAccumulatorCommitHandler<
  CommitArgs extends readonly any[]
> = (summary: SelectionAccumulatorCommitSummary, ...rest: CommitArgs) => void;

export class SelectionAccumulator<CommitArgs extends readonly any[]> {
  #nodes = new SingleTypeSelectionAccumulator<Node>();
  #edges = new SingleTypeSelectionAccumulator<Edge>();

  readonly #commitHandler: SelectionAccumulatorCommitHandler<CommitArgs>;

  public constructor(
    commitHandler: SelectionAccumulatorCommitHandler<CommitArgs> = (): void => {}
  ) {
    this.#commitHandler = commitHandler;
  }

  public get sizeNodes(): number {
    return this.#nodes.size;
  }
  public get sizeEdges(): number {
    return this.#edges.size;
  }

  public getNodes(): Node[] {
    return this.#nodes.getSelection();
  }
  public getEdges(): Edge[] {
    return this.#edges.getSelection();
  }

  public addNodes(...nodes: readonly Node[]): void {
    this.#nodes.add(...nodes);
  }
  public addEdges(...edges: readonly Edge[]): void {
    this.#edges.add(...edges);
  }

  public deleteNodes(node: Node): void {
    this.#nodes.delete(node);
  }
  public deleteEdges(edge: Edge): void {
    this.#edges.delete(edge);
  }

  public clear(): void {
    this.#nodes.clear();
    this.#edges.clear();
  }

  public commit(...rest: CommitArgs): SelectionAccumulatorCommitSummary {
    const summary = {
      nodes: this.#nodes.commit(),
      edges: this.#edges.commit(),
    };
    this.#commitHandler(summary, ...rest);
    return summary;
  }
}
